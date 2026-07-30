package com.example.FirstCopy.controller;

import com.example.FirstCopy.dto.PaymentFailedRequest;
import com.example.FirstCopy.dto.PaymentRequest;
import com.example.FirstCopy.dto.PaymentResponse;
import com.example.FirstCopy.dto.VerifyPaymentRequest;
import com.example.FirstCopy.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create")
    public PaymentResponse createPayment(
            @RequestBody PaymentRequest request) throws Exception {

        return paymentService.createPayment(request);
    }

    @PostMapping("/verify")
    public PaymentResponse verifyPayment(
            @RequestBody VerifyPaymentRequest request) throws Exception {

        return paymentService.verifyPayment(request);
    }

    @PostMapping("/failed")
    public ResponseEntity<Void> paymentFailed(
            @RequestBody PaymentFailedRequest request) {

        paymentService.paymentFailed(request);
        return ResponseEntity.ok().build();
    }
}