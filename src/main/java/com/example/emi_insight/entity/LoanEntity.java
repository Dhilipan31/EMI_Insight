package com.example.emi_insight.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Timestamp;
import java.time.LocalDate;

@Entity
@Table(name = "loans")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LoanEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true)
    private String loanId;
    private String name;
    private Double principal;
    private Double interest_rate;
    private Integer tenure_months;
    private Double emi;

    private Double remaining_principal;
    private Double interest_paid;
    private Integer emi_paid_count;
    private Integer remaining_emi_month;

    @Enumerated(EnumType.STRING)
    private LoanStatus loan_status;

    private LocalDate startDate;

    private Integer emiPayDay;
    private LocalDate lastPaymentDate;
    private LocalDate nextPaymentDate;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @Column(updatable = false)
    @CreationTimestamp
    private Timestamp created_at;
    @UpdateTimestamp
    private Timestamp updated_at;

}
