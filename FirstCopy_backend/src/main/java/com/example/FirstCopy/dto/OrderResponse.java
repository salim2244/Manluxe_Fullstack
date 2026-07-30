package com.example.FirstCopy.dto;

import com.example.FirstCopy.entity.OrderStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {

    private Long id;
    private Long orderId;
    private Double totalPrice;
    private OrderStatus status;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;

    // Add these for Admin
    private Long userId;
    private String userName;
    private String userEmail;
    private Double totalAmount;
    private LocalDateTime updatedAt;
}