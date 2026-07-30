package com.example.FirstCopy.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductSizeRequest {

    private String size;

    private Integer stock;

}