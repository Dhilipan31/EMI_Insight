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
@Table(name = "Payment_tbl")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaymentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String paymentId;

    private Double amount;
    private LocalDate payment_date;

    @ManyToOne
    @JoinColumn(name = "loan_id")
    private LoanEntity loan;

    @Column(updatable = false)
    @CreationTimestamp
    private Timestamp created_at;
    @UpdateTimestamp
    private Timestamp updated_at;

}
