package com.example.FirstCopy.dto;

import com.example.FirstCopy.entity.SizeType;
import lombok.*;
import com.example.FirstCopy.entity.Gender;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {

    private Long id;

    private String name;

    private String description;

    private Double price;

    private Double discount;

    private Integer stock;

    private String brand;

    private Gender gender;

    private String imageUrl;

    private Boolean active;

    private Long categoryId;

    private String categoryName;

    private SizeType sizeType;

    private List<ProductSizeResponse> sizes;
}