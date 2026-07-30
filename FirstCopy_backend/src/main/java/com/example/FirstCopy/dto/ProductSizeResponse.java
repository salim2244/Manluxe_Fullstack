package com.example.FirstCopy.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductSizeResponse {

    private Long id;

    private String size;

    private Integer stock;

}