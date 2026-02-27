package com.example.emi_insight.service;

import com.example.emi_insight.dto.PaymentRequestDTO;
import com.example.emi_insight.dto.PrePaymentDTO;
import com.example.emi_insight.entity.LoanEntity;
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

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final LoanRepository loanRepository;
    private final UserRepository userRepository;

    public PaymentEntity addEmiPayment(String loanId, PaymentRequestDTO request) {
        if (request.getAmount() == null || request.getAmount() <= 0) {
            throw new RuntimeException("Amount must be greater than 0");
        }

        if (request.getType() == null || !"EMI".equalsIgnoreCase(request.getType().trim())) {
            throw new RuntimeException("Payment type must be EMI");
        }

        LoanEntity loan = getOwnedLoan(loanId);
        validateEmiAmount(request.getAmount(), loan.getEmi());

        PaymentEntity payment = PaymentEntity.builder()
                .paymentId(UUID.randomUUID().toString())
                .amount(request.getAmount())
                .payment_date(LocalDate.now())
                .loan(loan)
                .type(PaymentType.EMI)
                .build();

        return paymentRepository.save(payment);
    }

    public PaymentEntity addPrePayment(String loanId, PrePaymentDTO request) {
        if (request.getAmount() == null || request.getAmount() <= 0) {
            throw new RuntimeException("Amount must be greater than 0");
        }

        LoanEntity loan = getOwnedLoan(loanId);

        PaymentEntity payment = PaymentEntity.builder()
                .paymentId(UUID.randomUUID().toString())
                .amount(request.getAmount())
                .payment_date(LocalDate.now())
                .loan(loan)
                .type(PaymentType.PRE_PAYMENT)
                .build();

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

    private UserEntity getCurrentLoggedInUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Authenticated user not found");
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found for email: " + email));
    }
}
