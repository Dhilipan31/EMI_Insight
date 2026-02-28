package com.example.emi_insight.service;

import com.example.emi_insight.dto.DashboardDTO;
import com.example.emi_insight.entity.LoanEntity;
import com.example.emi_insight.entity.UserEntity;
import com.example.emi_insight.repository.LoanRepository;
import com.example.emi_insight.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final LoanRepository loanRepository;
    private final UserRepository userRepository;
    private final CalculationService cs;

    public DashboardDTO getDashboard() {
        UserEntity currentUser = getCurrentLoggedInUser();
        List<LoanEntity> loans = loanRepository.findAllByUser(currentUser);

        if (loans.isEmpty()) {
            return DashboardDTO.builder()
                    .totalOutstanding(0.0)
                    .totalMonthlyEmi(0.0)
                    .totalInterestRemaining(0.0)
                    .debtFreeDate(LocalDate.now())
                    .highestInterestLoan(null)
                    .loanDistribution(new ArrayList<>())
                    .build();
        }

        double totalOutstanding = 0.0;
        double totalMonthlyEmi = 0.0;
        double totalInterestRemaining = 0.0;
        LocalDate debtFreeDate = LocalDate.now();
        LoanEntity highestInterestLoan = null;

        Map<String, Double> distribution = new HashMap<>();

        for (LoanEntity loan : loans) {
            double outstanding = cs.safe(loan.getRemaining_principal());
            int remainingMonths = loan.getRemaining_emi_month() == null
                    ? cs.calculateRemainingMonths(outstanding, loan.getEmi(), loan.getInterest_rate())
                    : loan.getRemaining_emi_month();

            totalOutstanding += outstanding;
            if (outstanding > 0) {
                totalMonthlyEmi += cs.safe(loan.getEmi());
            }
            totalInterestRemaining += Math.max((cs.safe(loan.getEmi()) * remainingMonths) - outstanding, 0.0);

            LocalDate closingDate = LocalDate.now().plusMonths(Math.max(remainingMonths, 0));
            if (closingDate.isAfter(debtFreeDate)) {
                debtFreeDate = closingDate;
            }

            if (highestInterestLoan == null || loan.getInterest_rate() > highestInterestLoan.getInterest_rate()) {
                highestInterestLoan = loan;
            }

            String loanName = loan.getName() == null ? "Unknown" : loan.getName();
            distribution.put(loanName, distribution.getOrDefault(loanName, 0.0) + outstanding);
        }

        List<DashboardDTO.LoanDistributionDTO> loanDistribution = distribution.entrySet()
                .stream()
                .map(entry -> DashboardDTO.LoanDistributionDTO.builder()
                        .name(entry.getKey())
                        .amount(entry.getValue())
                        .build())
                .toList();

        DashboardDTO.HighestInterestLoanDTO highestInterestDto = null;
        if (highestInterestLoan != null) {
            highestInterestDto = DashboardDTO.HighestInterestLoanDTO.builder()
                    .loanId(highestInterestLoan.getLoanId())
                    .name(highestInterestLoan.getName())
                    .interestRate(highestInterestLoan.getInterest_rate())
                    .build();
        }

        return DashboardDTO.builder()
                .totalOutstanding(totalOutstanding)
                .totalMonthlyEmi(totalMonthlyEmi)
                .totalInterestRemaining(totalInterestRemaining)
                .debtFreeDate(debtFreeDate)
                .highestInterestLoan(highestInterestDto)
                .loanDistribution(loanDistribution)
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
}
