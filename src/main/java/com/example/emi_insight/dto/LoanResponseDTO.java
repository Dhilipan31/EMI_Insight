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
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LoanResponseDTO {
    private String loanId;
    private String name;
    private Double principal;
    private Double remaining_principal;

    @Enumerated(EnumType.STRING)
    private LoanStatus loan_status;
    private Double interest_paid;
    private Integer emi_paid_count;
    private Integer remaining_emi_month;

    private Double interestRate;
    private Integer tenureMonths;
    private Double emi;
    private LocalDate startDate;
}
