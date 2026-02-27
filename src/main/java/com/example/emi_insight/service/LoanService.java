package com.example.emi_insight.service;

import com.example.emi_insight.dto.AmortizationSummaryDTO;
import com.example.emi_insight.dto.LoanRequestDTO;
import com.example.emi_insight.dto.LoanDetailsResponseDTO;
import com.example.emi_insight.dto.LoanResponseDTO;
import com.example.emi_insight.dto.SimulatePrepaymentResponseDTO;
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
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LoanService {

    private final LoanRepository loanRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    public LoanResponseDTO createLoan(LoanRequestDTO request) {

        Double emi = emiCalculator(request.getPrincipal(), request.getInterestRate(), request.getTenureMonths());
        UserEntity currentUser = getCurrentLoggedInUser();

        LoanEntity loanEntity = convertEntity(request);

        loanEntity.setEmi(emi);
        loanEntity.setUser(currentUser);

        LoanEntity savedLoan = null;
        try {
            savedLoan = loanRepository.save(loanEntity);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        return convertDTO(savedLoan);
    }

    public LoanResponseDTO getLoan(){
        UserEntity currentUser = getCurrentLoggedInUser();

        LoanEntity existLoan = loanRepository.findByUser(currentUser)
                .orElseThrow(() -> new RuntimeException("No loan record found for this user"));

        return convertDTO(existLoan);
    }

    public LoanDetailsResponseDTO getLoanDetails(String loanId) {
        UserEntity currentUser = getCurrentLoggedInUser();

        LoanEntity loan = loanRepository.findByLoanIdAndUser(loanId, currentUser)
                .orElseThrow(() -> new RuntimeException("Loan not found for this user"));

        List<PaymentEntity> payments = paymentRepository.findPaymentsByLoanOrdered(loan);

        LoanComputationState state = calculateLoanState(loan, payments);
        double outstandingBalance = state.outstandingBalance();
        double totalPaid = state.totalPaid();
        double principalPaid = state.principalPaid();
        double interestPaid = state.interestPaid();

        int paidInstallments = payments.size();
        int remainingInstallments = 0;
        if (loan.getEmi() != null && loan.getEmi() > 0 && outstandingBalance > 0) {
            remainingInstallments = (int) Math.ceil(outstandingBalance / loan.getEmi());
        }

        AmortizationSummaryDTO summary = AmortizationSummaryDTO.builder()
                .totalPaid(totalPaid)
                .principalPaid(principalPaid)
                .paidInstallments(paidInstallments)
                .remainingInstallments(remainingInstallments)
                .emi(loan.getEmi())
                .build();

        return LoanDetailsResponseDTO.builder()
                .loanId(loan.getLoanId())
                .outstandingBalance(outstandingBalance)
                .interestPaid(interestPaid)
                .amortizationSummary(summary)
                .build();
    }

    public SimulatePrepaymentResponseDTO simulatePrepayment(String loanId, Double extraAmount) {
        if (extraAmount == null || extraAmount <= 0) {
            throw new RuntimeException("extraAmount must be greater than 0");
        }

        UserEntity currentUser = getCurrentLoggedInUser();
        LoanEntity loan = loanRepository.findByLoanIdAndUser(loanId, currentUser)
                .orElseThrow(() -> new RuntimeException("Loan not found for this user"));

        List<PaymentEntity> payments = paymentRepository.findPaymentsByLoanOrdered(loan);
        LoanComputationState state = calculateLoanState(loan, payments);

        double currentOutstanding = state.outstandingBalance();
        if (currentOutstanding <= 0) {
            return SimulatePrepaymentResponseDTO.builder()
                    .interestSaved(0.0)
                    .monthsReduced(0)
                    .newClosingDate(LocalDate.now())
                    .build();
        }

        double newOutstanding = Math.max(currentOutstanding - extraAmount, 0.0);
        int currentRemainingMonths = calculateRemainingMonths(currentOutstanding, loan.getEmi(), loan.getInterest_rate());
        int newRemainingMonths = calculateRemainingMonths(newOutstanding, loan.getEmi(), loan.getInterest_rate());

        int monthsReduced = Math.max(currentRemainingMonths - newRemainingMonths, 0);
        double interestBefore = Math.max((loan.getEmi() * currentRemainingMonths) - currentOutstanding, 0.0);
        double interestAfter = Math.max((loan.getEmi() * newRemainingMonths) - newOutstanding, 0.0);
        double interestSaved = Math.max(interestBefore - interestAfter, 0.0);

        LocalDate baseDate = LocalDate.now();
        LocalDate newClosingDate = baseDate.plusMonths(newRemainingMonths);

        return SimulatePrepaymentResponseDTO.builder()
                .interestSaved(interestSaved)
                .monthsReduced(monthsReduced)
                .newClosingDate(newClosingDate)
                .build();
    }

    private LoanComputationState calculateLoanState(LoanEntity loan, List<PaymentEntity> payments) {
        double monthlyRate = loan.getInterest_rate() / (12 * 100);
        double outstandingBalance = loan.getPrincipal();
        double totalPaid = 0.0;
        double principalPaid = 0.0;
        double interestPaid = 0.0;

        for (PaymentEntity payment : payments) {
            double paymentAmount = payment.getAmount() == null ? 0.0 : payment.getAmount();
            double interestComponent = 0.0;
            double principalComponent = paymentAmount;

            if (payment.getType() == PaymentType.EMI || payment.getType() == null) {
                double interestDue = outstandingBalance * monthlyRate;
                interestComponent = Math.min(paymentAmount, interestDue);
                principalComponent = paymentAmount - interestComponent;
            }

            principalComponent = Math.min(principalComponent, outstandingBalance);

            totalPaid += paymentAmount;
            interestPaid += interestComponent;
            principalPaid += principalComponent;
            outstandingBalance -= principalComponent;
        }

        outstandingBalance = Math.max(outstandingBalance, 0.0);
        return new LoanComputationState(outstandingBalance, totalPaid, principalPaid, interestPaid);
    }

    private LoanResponseDTO convertDTO(LoanEntity savedLoan) {
        return LoanResponseDTO.builder()
                .loanId(savedLoan.getLoanId())
                .name(savedLoan.getName())
                .principal(savedLoan.getPrincipal())
                .interestRate(savedLoan.getInterest_rate())
                .tenureMonths(savedLoan.getTenure_months())
                .emi(savedLoan.getEmi())
                .startDate(savedLoan.getStartDate())
                .build();
    }

    private LoanEntity convertEntity(LoanRequestDTO request) {
        return LoanEntity.builder()
                .name(request.getName())
                .loanId(UUID.randomUUID().toString())
                .principal(request.getPrincipal())
                .interest_rate(request.getInterestRate())
                .tenure_months(request.getTenureMonths())
                .startDate(request.getStartDate())
                .build();
    }

    private Double emiCalculator(Double principal, Double interestRate, Integer tenureMonths) {

        Double rate = interestRate / (12 * 100);
        return (principal * rate * (Double) Math.pow(1 + rate, tenureMonths))/
                ((Double)Math.pow(1 +rate, tenureMonths) - 1);

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

    private int calculateRemainingMonths(double principal, double emi, double annualRate) {
        if (principal <= 0) {
            return 0;
        }
        if (emi <= 0) {
            throw new RuntimeException("Invalid EMI for loan");
        }

        double monthlyRate = annualRate / (12 * 100);
        if (monthlyRate <= 0) {
            return (int) Math.ceil(principal / emi);
        }

        double ratio = (principal * monthlyRate) / emi;
        if (ratio >= 1) {
            throw new RuntimeException("EMI is too low to close this loan");
        }

        double months = -Math.log(1 - ratio) / Math.log(1 + monthlyRate);
        return (int) Math.ceil(months);
    }

    private record LoanComputationState(
            double outstandingBalance,
            double totalPaid,
            double principalPaid,
            double interestPaid
    ) {
    }
}
