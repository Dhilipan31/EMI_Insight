package com.example.emi_insight.controller;

import com.example.emi_insight.dto.LoanDetailsResponseDTO;
import com.example.emi_insight.dto.LoanRequestDTO;
import com.example.emi_insight.dto.LoanResponseDTO;
import com.example.emi_insight.dto.PaymentRequestDTO;
import com.example.emi_insight.dto.PrePaymentDTO;
import com.example.emi_insight.dto.SimulatePrepaymentRequestDTO;
import com.example.emi_insight.dto.SimulatePrepaymentResponseDTO;
import com.example.emi_insight.entity.PaymentEntity;
import com.example.emi_insight.service.LoanService;
import com.example.emi_insight.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/loans"})
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;
    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<?> addLoan( @RequestBody LoanRequestDTO request){
        try {
            LoanResponseDTO response = loanService.createLoan(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message" ,e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllLoans() {
        try {
            return ResponseEntity.ok(loanService.getAllLoans());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{loanId}")
    public ResponseEntity<?> getLoanDetails(@PathVariable String loanId) {
        try {
            LoanDetailsResponseDTO response = loanService.getLoanDetails(loanId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{loanId}/payments")
    public ResponseEntity<?> addEmiPayment(@PathVariable String loanId, @RequestBody PaymentRequestDTO request) {
        try {
            PaymentEntity payment = paymentService.addEmiPayment(loanId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "paymentId", payment.getPaymentId(),
                    "loanId", loanId,
                    "amount", payment.getAmount(),
                    "type", payment.getType(),
                    "paymentDate", payment.getPayment_date()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{loanId}/prepayment")
    public ResponseEntity<?> addPrepayment(@PathVariable String loanId, @RequestBody PrePaymentDTO request) {
        try {
            PaymentEntity payment = paymentService.addPrePayment(loanId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "paymentId", payment.getPaymentId(),
                    "loanId", loanId,
                    "amount", payment.getAmount(),
                    "type", payment.getType(),
                    "paymentDate", payment.getPayment_date()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{loanId}/simulate-prepayment")
    public ResponseEntity<?> simulatePrepayment(@PathVariable String loanId, @RequestBody SimulatePrepaymentRequestDTO request) {
        try {
            SimulatePrepaymentResponseDTO response = loanService.simulatePrepayment(loanId, request.getExtraAmount());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
