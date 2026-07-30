package com.example.FirstCopy.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponse {

    // Existing fields
    private String productName;
    private Double price;
    private Integer quantity;
    private Double total;

    // Add these for Admin page
    private Long productId;
    private String brand;
    private String imageUrl;
}