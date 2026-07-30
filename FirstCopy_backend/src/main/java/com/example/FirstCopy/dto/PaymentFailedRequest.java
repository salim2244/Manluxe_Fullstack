package com.example.FirstCopy.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentFailedRequest {

    private String razorpayOrderId;

}