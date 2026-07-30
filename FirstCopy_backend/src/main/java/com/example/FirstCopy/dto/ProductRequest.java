package com.example.FirstCopy.dto;

import com.example.FirstCopy.entity.SizeType;
import jakarta.validation.constraints.*;
import lombok.*;
import com.example.FirstCopy.entity.Gender;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRequest {

    @NotBlank
    private String name;

    private String description;

    @NotNull
    @Positive
    private Double price;

    private Double discount;

    @NotNull
    @PositiveOrZero
    private Integer stock;

    private String brand;

    @NotNull
    private Gender gender;

    private String imageUrl;

    private Boolean active;

    @NotNull
    private SizeType sizeType;

    @NotNull
    private Long categoryId;

    private List<ProductSizeRequest> sizes;
}