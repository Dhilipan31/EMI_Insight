package com.example.emi_insight.service;

import com.example.emi_insight.dto.PaymentRequestDTO;
import com.example.emi_insight.dto.PrepaymentMode;
import com.example.emi_insight.dto.PrePaymentDTO;
import com.example.emi_insight.entity.LoanEntity;
import com.example.emi_insight.entity.LoanStatus;
import com.example.emi_insight.entity.PaymentEntity;
import com.example.emi_insight.entity.PaymentType;
import com.example.emi_insight.entity.UserEntity;
import com.example.emi_insight.repository.LoanRepository;
import com.example.emi_insight.repository.PaymentRepository;
import com.example.emi_insight.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final LoanRepository loanRepository;
    private final UserRepository userRepository;
    private final CalculationService cs;

    @Transactional
    public PaymentEntity addEmiPayment(String loanId, PaymentRequestDTO request) {
        if (request.getAmount() == null || request.getAmount() <= 0) {
            throw new RuntimeException("Amount must be greater than 0");
        }
        if (request.getPaymentDate() == null) {
            throw new RuntimeException("paymentDate is required");
        }

        if (request.getType() == null || !"EMI".equalsIgnoreCase(request.getType().trim())) {
            throw new RuntimeException("Payment type must be EMI");
        }

        LoanEntity loan = getOwnedLoan(loanId);
        validateEmiAmount(request.getAmount(), loan.getEmi());
        PaymentBreakup breakup = applyEmiOnLoan(loan, request.getAmount());

        PaymentEntity payment = PaymentEntity.builder()
                .paymentId(UUID.randomUUID().toString())
                .amount(request.getAmount())
                .principal_paid(breakup.principalPaid())
                .interest_paid(breakup.interestPaid())
                .payment_date(request.getPaymentDate())
                .loan(loan)
                .type(PaymentType.EMI)
                .build();

        loanRepository.save(loan);
        return paymentRepository.save(payment);
    }

    @Transactional
    public PaymentEntity addPrePayment(String loanId, PrePaymentDTO request) {
        if (request.getAmount() == null || request.getAmount() <= 0) {
            throw new RuntimeException("Amount must be greater than 0");
        }
        if (request.getPaymentDate() == null) {
            throw new RuntimeException("paymentDate is required");
        }
        if (request.getMode() == null || request.getMode().isBlank()) {
            throw new RuntimeException("mode is required: TENURE_REDUCTION or EMI_REDUCTION");
        }

        LoanEntity loan = getOwnedLoan(loanId);
        PrepaymentMode mode = parseMode(request.getMode());
        PaymentBreakup breakup = applyPrepaymentOnLoan(loan, request.getAmount(), mode);

        PaymentEntity payment = PaymentEntity.builder()
                .paymentId(UUID.randomUUID().toString())
                .amount(request.getAmount())
                .principal_paid(breakup.principalPaid())
                .interest_paid(breakup.interestPaid())
                .payment_date(request.getPaymentDate())
                .loan(loan)
                .type(PaymentType.PRE_PAYMENT)
                .build();

        loanRepository.save(loan);
        return paymentRepository.save(payment);
    }

    private LoanEntity getOwnedLoan(String loanId) {
        UserEntity currentUser = getCurrentLoggedInUser();
        return loanRepository.findByLoanIdAndUser(loanId, currentUser)
                .orElseThrow(() -> new RuntimeException("Loan not found for this user"));
    }

    private void validateEmiAmount(Double paymentAmount, Double loanEmi) {
        if (loanEmi == null || loanEmi <= 0) {
            throw new RuntimeException("Invalid EMI configured for loan");
        }

        long paymentWhole = (long) Math.floor(paymentAmount);
        long emiWhole = (long) Math.floor(loanEmi);
        if (paymentWhole != emiWhole) {
            throw new RuntimeException("EMI amount must match loan EMI");
        }
    }

    private PaymentBreakup applyEmiOnLoan(LoanEntity loan, Double paymentAmount) {
        Double outstanding = cs.safe(loan.getRemaining_principal());
        if (outstanding <= 0) {
            throw new RuntimeException("Loan already closed");
        }

        Double monthlyRate = cs.safe(loan.getInterest_rate()) / (12 * 100);
        Double interestDue = outstanding * monthlyRate;
        Double interestComponent = Math.min(paymentAmount, interestDue);
        Double principalComponent = paymentAmount - interestComponent;
        principalComponent = Math.min(principalComponent, outstanding);

        loan.setInterest_paid(cs.safe(loan.getInterest_paid()) + interestComponent);
        Double newOutstanding = Math.max(outstanding - principalComponent, 0.0);
        loan.setRemaining_principal(newOutstanding);
        loan.setEmi_paid_count((loan.getEmi_paid_count() == null ? 0 : loan.getEmi_paid_count()) + 1);
        int remainingMonths = loan.getRemaining_emi_month() == null ? 0 : loan.getRemaining_emi_month();
        loan.setRemaining_emi_month(Math.max(remainingMonths - 1, 0));
        updateLoanStatus(loan);
        return new PaymentBreakup(principalComponent, interestComponent);
    }

    private PaymentBreakup applyPrepaymentOnLoan(LoanEntity loan, Double paymentAmount, PrepaymentMode mode) {
        Double outstanding = cs.safe(loan.getRemaining_principal());
        if (outstanding <= 0) {
            throw new RuntimeException("Loan already closed");
        }

        Double principalComponent = Math.min(paymentAmount, outstanding);
        Double newOutstanding = Math.max(outstanding - principalComponent, 0.0);
        loan.setRemaining_principal(newOutstanding);

        if (mode == PrepaymentMode.TENURE_REDUCTION) {
            int newRemaining = cs.calculateRemainingMonths(newOutstanding, loan.getEmi(), loan.getInterest_rate());
            loan.setRemaining_emi_month(newRemaining);
        } else {
            int remainingMonths = loan.getRemaining_emi_month() == null ? 0 : loan.getRemaining_emi_month();
            if (newOutstanding <= 0 || remainingMonths <= 0) {
                loan.setEmi(0.0);
                loan.setRemaining_emi_month(0);
            } else {
                loan.setEmi(cs.round2(cs.calculateEmi(newOutstanding, loan.getInterest_rate(), remainingMonths)));
            }
        }

        updateLoanStatus(loan);
        return new PaymentBreakup(principalComponent, 0.0);
    }

    private void updateLoanStatus(LoanEntity loan) {
        if (cs.safe(loan.getRemaining_principal()) <= 0) {
            loan.setLoan_status(LoanStatus.CLOSED);
            loan.setRemaining_principal(0.0);
            loan.setRemaining_emi_month(0);
            loan.setEmi(0.0);
        } else {
            loan.setLoan_status(LoanStatus.ACTIVE);
        }
    }

    private PrepaymentMode parseMode(String rawMode) {
        try {
            return PrepaymentMode.valueOf(rawMode.trim().toUpperCase());
        } catch (Exception ex) {
            throw new RuntimeException("Invalid mode. Use TENURE_REDUCTION or EMI_REDUCTION");
        }
    }

    private UserEntity getCurrentLoggedInUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Authenticated user not found");
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found for email: " + email));
    }

    private record PaymentBreakup(Double principalPaid, Double interestPaid) {
    }
}
