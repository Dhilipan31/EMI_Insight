package com.example.emi_insight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LoanRequestDTO {
    private String name;
    private Double principal;
    private Double interestRate;
    private Integer tenureMonths;
    private LocalDate startDate;
}
