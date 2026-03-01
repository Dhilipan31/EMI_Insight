package com.example.emi_insight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulatePrepaymentResponseDTO {
    private Double interestSaved;
    private Integer monthsReduced;
    private LocalDate newClosingDate;
    private String recommendation;
    private String reason;
}
