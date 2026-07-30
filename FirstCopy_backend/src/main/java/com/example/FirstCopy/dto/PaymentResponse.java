package com.example.FirstCopy.dto;

import com.example.FirstCopy.entity.PaymentStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {

    private Long paymentId;

    private String razorpayOrderId;

    private Double amount;

    private PaymentStatus status;
}