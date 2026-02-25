package com.example.emi_insight.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Timestamp;
import java.time.LocalDate;

@Entity
@Table(name = "loans")
public class LoanEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    @Column(unique = true)
    public String loanId;
    public String name;
    public Double principal;
    public Double interest_rate;
    public Integer tenure_months;
    public Double emi;
    public LocalDate startDate;

    @Column(updatable = false)
    @CreationTimestamp
    public Timestamp created_at;
    @UpdateTimestamp
    public Timestamp updated_at;



}
