package com.example.FirstCopy.service;

import com.example.FirstCopy.dto.CategoryDto;

import java.util.List;

public interface CategoryService {
    CategoryDto createCategory (CategoryDto categoryDto);

    List<CategoryDto> getAllCategories();
    CategoryDto getCategoryById(Long id);
    CategoryDto updateCategory (Long id, CategoryDto categoryDto);

    void deleteCategory(Long id);
}
