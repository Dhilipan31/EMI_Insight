package com.example.emi_insight.service;

import com.example.emi_insight.dto.AmortizationSummaryDTO;
import com.example.emi_insight.dto.LoanRequestDTO;
import com.example.emi_insight.dto.LoanDetailsResponseDTO;
import com.example.emi_insight.dto.LoanResponseDTO;
import com.example.emi_insight.dto.SimulatePrepaymentResponseDTO;
import com.example.emi_insight.entity.LoanEntity;
import com.example.emi_insight.entity.LoanStatus;
import com.example.emi_insight.entity.UserEntity;
import com.example.emi_insight.repository.LoanRepository;
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
    private final UserRepository userRepository;
    private final CalculationService cs;

    public LoanResponseDTO createLoan(LoanRequestDTO request) {

        validateLoanRequest(request);
        Double emi = cs.calculateEmi(request.getPrincipal(), request.getInterestRate(), request.getTenureMonths());
        UserEntity currentUser = getCurrentLoggedInUser();

        LoanEntity loanEntity = convertEntity(request);

        loanEntity.setEmi(cs.round2(emi));
        loanEntity.setRemaining_principal(request.getPrincipal());
        loanEntity.setInterest_paid(0.0);
        loanEntity.setEmi_paid_count(0);
        loanEntity.setRemaining_emi_month(request.getTenureMonths());
        loanEntity.setLoan_status(LoanStatus.ACTIVE);
        loanEntity.setUser(currentUser);

        // Initialize payment date fields
        loanEntity.setNextPaymentDate(calculateNextPaymentDate(request.getStartDate(), request.getEmiPayDay()));

        LoanEntity savedLoan;
        try {
            savedLoan = loanRepository.save(loanEntity);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        return convertDTO(savedLoan);
    }

    public List<LoanResponseDTO> getAllLoans() {
        UserEntity currentUser = getCurrentLoggedInUser();
        return loanRepository.findAllByUser(currentUser).stream()
                .map(this::convertDTO)
                .toList();
    }

    public LoanDetailsResponseDTO getLoanDetails(String loanId) {
        UserEntity currentUser = getCurrentLoggedInUser();

        LoanEntity loan = loanRepository.findByLoanIdAndUser(loanId, currentUser)
                .orElseThrow(() -> new RuntimeException("Loan not found for this user"));
        Double outstandingBalance = cs.safe(loan.getRemaining_principal());
        Double interestPaid = cs.safe(loan.getInterest_paid());
        Double principalPaid = Math.max(cs.safe(loan.getPrincipal()) - outstandingBalance, 0.0);
        Double totalPaid = principalPaid + interestPaid;
        int paidInstallments = loan.getEmi_paid_count() == null ? 0 : loan.getEmi_paid_count();
        int remainingInstallments = loan.getRemaining_emi_month() == null
                ? cs.calculateRemainingMonths(outstandingBalance, loan.getEmi(), loan.getInterest_rate())
                : loan.getRemaining_emi_month();

        AmortizationSummaryDTO summary = AmortizationSummaryDTO.builder()
                .totalPaid(totalPaid)
                .principalPaid(principalPaid)
                .paidInstallments(paidInstallments)
                .remainingInstallments(remainingInstallments)
                .emi(cs.round2(loan.getEmi()))
                .build();

        return LoanDetailsResponseDTO.builder()
                .loanId(loan.getLoanId())
                .principal(loan.getPrincipal())
                .outstandingBalance(outstandingBalance)
                .interestPaid(interestPaid)
                .loan_status(loan.getLoan_status())
                .emi_paid_count(loan.getEmi_paid_count())
                .tenure_months(loan.getTenure_months())
                .lastPaymentDate(loan.getLastPaymentDate())
                .nextPaymentDate(loan.getNextPaymentDate())
                .emiPayDay(loan.getEmiPayDay())
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

        double currentOutstanding = cs.safe(loan.getRemaining_principal());
        if (currentOutstanding <= 0) {
            return SimulatePrepaymentResponseDTO.builder()
                    .interestSaved(0.0)
                    .monthsReduced(0)
                    .newClosingDate(LocalDate.now())
                    .recommendation("N/A")
                    .reason("Loan is already closed")
                    .build();
        }

        double newOutstanding = Math.max(currentOutstanding - extraAmount, 0.0);
        int currentRemainingMonths = loan.getRemaining_emi_month() == null
                ? cs.calculateRemainingMonths(currentOutstanding, loan.getEmi(), loan.getInterest_rate())
                : loan.getRemaining_emi_month();
        int newRemainingMonths = cs.calculateRemainingMonths(newOutstanding, loan.getEmi(), loan.getInterest_rate());

        int monthsReduced = Math.max(currentRemainingMonths - newRemainingMonths, 0);
        Double interestBefore = Math.max((cs.safe(loan.getEmi()) * currentRemainingMonths) - currentOutstanding, 0.0);
        Double interestAfter = Math.max((cs.safe(loan.getEmi()) * newRemainingMonths) - newOutstanding, 0.0);
        Double interestSaved = Math.max(interestBefore - interestAfter, 0.0);

        LocalDate baseDate = LocalDate.now();
        LocalDate newClosingDate = baseDate.plusMonths(newRemainingMonths);

        // Fetch user salary and calculate disposable income
        Double salary = currentUser.getSalary();
        Double monthlyExpense = currentUser.getMonthlyExpense();

        String recommendation = "N/A";
        String reason = "User has not set salary or monthly expense";

        if (salary != null && salary > 0 && monthlyExpense != null) {
            // Calculate total monthly EMI across all loans
            List<LoanEntity> allLoans = loanRepository.findAllByUser(currentUser);
            double totalMonthlyEmi = 0.0;
            for (LoanEntity userLoan : allLoans) {
                if (userLoan.getLoan_status() == LoanStatus.ACTIVE) {
                    totalMonthlyEmi += cs.safe(userLoan.getEmi());
                }
            }

            double disposableIncome = salary - monthlyExpense - totalMonthlyEmi;
            double disposableIncomePercentage = (disposableIncome / salary) * 100;

            if (disposableIncomePercentage > 30) {
                recommendation = "TENURE_REDUCTION";
                reason = String.format("Disposable income (%.2f%%) is greater than 30%% of salary. Recommended to use prepayment to reduce tenure and save on interest.", disposableIncomePercentage);
            } else {
                recommendation = "EMI_REDUCTION";
                reason = String.format("Disposable income (%.2f%%) is less than or equal to 30%% of salary. Recommended to use prepayment to reduce EMI for cash flow flexibility.", disposableIncomePercentage);
            }
        }

        return SimulatePrepaymentResponseDTO.builder()
                .interestSaved(interestSaved)
                .monthsReduced(monthsReduced)
                .newClosingDate(newClosingDate)
                .recommendation(recommendation)
                .reason(reason)
                .build();
    }

    private LoanResponseDTO convertDTO(LoanEntity savedLoan) {
        return LoanResponseDTO.builder()
                .loanId(savedLoan.getLoanId())
                .name(savedLoan.getName())
                .principal(savedLoan.getPrincipal())
                .interestRate(savedLoan.getInterest_rate())
                .tenureMonths(savedLoan.getTenure_months())
                .emi(cs.round2(savedLoan.getEmi()))
                .startDate(savedLoan.getStartDate())
                .remaining_principal(savedLoan.getRemaining_principal())
                .loan_status(savedLoan.getLoan_status())
                .emi_paid_count(savedLoan.getEmi_paid_count())
                .remaining_emi_month(savedLoan.getRemaining_emi_month())
                .interest_paid(savedLoan.getInterest_paid())
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

    private UserEntity getCurrentLoggedInUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Authenticated user not found");
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found for email: " + email));
    }

    private void validateLoanRequest(LoanRequestDTO request) {
        if (request.getEmiPayDay() == null || request.getEmiPayDay() < 1 || request.getEmiPayDay() > 28) {
            throw new RuntimeException("emiPayDay must be between 1 and 28");
        }
    }

    private LocalDate calculateNextPaymentDate(LocalDate startDate, Integer emiPayDay) {
        // If startDate day is already past emiPayDay, schedule for next month
        if (startDate.getDayOfMonth() >= emiPayDay) {
            return startDate.plusMonths(1).withDayOfMonth(emiPayDay);
        } else {
            return startDate.withDayOfMonth(emiPayDay);
        }
    }

}
