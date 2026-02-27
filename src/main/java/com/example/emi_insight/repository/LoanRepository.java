package com.example.emi_insight.repository;

import com.example.emi_insight.entity.LoanEntity;
import com.example.emi_insight.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoanRepository extends JpaRepository<LoanEntity, Long> {

    Optional<LoanEntity> findByUser(UserEntity user);

    Optional<LoanEntity> findByLoanIdAndUser(String loanId, UserEntity user);
}
