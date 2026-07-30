package com.example.FirstCopy.service;

import com.example.FirstCopy.dto.PaymentFailedRequest;
import com.example.FirstCopy.dto.PaymentRequest;
import com.example.FirstCopy.dto.PaymentResponse;
import com.example.FirstCopy.dto.VerifyPaymentRequest;

public interface PaymentService {

    PaymentResponse createPayment(PaymentRequest request) throws Exception;

    PaymentResponse verifyPayment(VerifyPaymentRequest request) throws Exception;

    void paymentFailed(PaymentFailedRequest request);
}