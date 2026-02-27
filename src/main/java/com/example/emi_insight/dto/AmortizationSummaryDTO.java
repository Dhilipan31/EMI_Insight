package com.example.emi_insight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AmortizationSummaryDTO {
    private Double totalPaid;
    private Double principalPaid;
    private Integer paidInstallments;
    private Integer remainingInstallments;
    private Double emi;
}
