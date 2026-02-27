package com.example.emi_insight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanDetailsResponseDTO {
    private String loanId;
    private Double outstandingBalance;
    private Double interestPaid;
    private AmortizationSummaryDTO amortizationSummary;
}
