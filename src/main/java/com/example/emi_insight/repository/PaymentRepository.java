package com.example.emi_insight.repository;

import com.example.emi_insight.entity.LoanEntity;
import com.example.emi_insight.entity.PaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentEntity, Long> {

    @Query("select p from PaymentEntity p where p.loan = :loan order by p.payment_date asc")
    List<PaymentEntity> findPaymentsByLoanOrdered(LoanEntity loan);
}
