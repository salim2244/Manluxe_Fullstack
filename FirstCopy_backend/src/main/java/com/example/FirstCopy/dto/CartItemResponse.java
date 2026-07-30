package com.example.FirstCopy.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemResponse {

    private Long cartItemId;

    private Long productId;

    private String productName;

    private Double price;

    private Integer quantity;

    private Double totalPrice;

    private String imageUrl;

    private String brand;

    private String size;

    private Integer remainingStock;
}