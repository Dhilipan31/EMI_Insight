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
public class PrePaymentDTO {
    private Double amount;
    private LocalDate paymentDate;
    private String mode;
}
