package com.example.emi_insight.dto;

import com.example.emi_insight.entity.PaymentType;
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
public class PaymentHistoryDTO {
    private String paymentId;

    private Double amount;
    private Double principal_paid;
    private Double interest_paid;
    private LocalDate payment_date;
    @Enumerated(EnumType.STRING)
    private PaymentType type;
}
