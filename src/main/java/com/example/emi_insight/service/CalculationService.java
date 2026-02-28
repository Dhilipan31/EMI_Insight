package com.example.emi_insight.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class CalculationService {

    public Double calculateEmi(Double principal, Double annualRate, Integer tenureMonths) {
        if (principal == null || principal <= 0 || tenureMonths == null || tenureMonths <= 0) {
            return 0.0;
        }

        double monthlyRate = safe(annualRate) / (12 * 100);
        if (monthlyRate <= 0) {
            return round2(principal / tenureMonths);
        }

        double factor = Math.pow(1 + monthlyRate, tenureMonths);
        return round2((principal * monthlyRate * factor) / (factor - 1));
    }

    public int calculateRemainingMonths(Double principal, Double emi, Double annualRate) {
        if (principal == null || principal <= 0) {
            return 0;
        }

        if (emi == null || emi <= 0) {
            throw new RuntimeException("Invalid EMI for loan");
        }

        double rate = safe(annualRate) / (12 * 100);
        if (rate <= 0) {
            return (int) Math.ceil(principal / emi);
        }

        double ratio = (principal * rate) / emi;
        if (ratio >= 1) {
            throw new RuntimeException("EMI is too low to close this loan");
        }

        double months = -Math.log(1 - ratio) / Math.log(1 + rate);
        return (int) Math.ceil(months);
    }

    public Double round2(Double value) {
        if (value == null) {
            return null;
        }
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    public double safe(Double value) {
        return value == null ? 0.0 : value;
    }
}
