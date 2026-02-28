package com.example.emi_insight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
    private Double totalOutstanding;
    private Double totalMonthlyEmi;
    private Double totalInterestRemaining;
    private LocalDate debtFreeDate;
    private HighestInterestLoanDTO highestInterestLoan;
    private List<LoanDistributionDTO> loanDistribution;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HighestInterestLoanDTO {
        private String loanId;
        private String name;
        private Double interestRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoanDistributionDTO {
        private String name;
        private Double amount;
    }
}
