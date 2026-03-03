package com.example.emi_insight.dto;

import com.example.emi_insight.entity.LoanStatus;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanDetailsResponseDTO {
    private String loanId;
    private Double principal;
    private Double outstandingBalance;
    private Double interestPaid;
    private Integer tenure_months;
    private Integer emi_paid_count;
    private Integer emiPayDay;
    @Enumerated(EnumType.STRING)
    private LoanStatus loan_status;

    private LocalDate nextPaymentDate;
    private LocalDate lastPaymentDate;

    private AmortizationSummaryDTO amortizationSummary;
}
