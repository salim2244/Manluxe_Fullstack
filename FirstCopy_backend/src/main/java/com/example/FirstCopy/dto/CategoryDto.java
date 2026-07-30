package com.example.FirstCopy.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class CategoryDto {
    private Long id;

    @NotBlank(message = "category name is required")
    private String name;

    private String gender;
}
