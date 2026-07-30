package com.example.FirstCopy.ServiceImpl;

import com.example.FirstCopy.dto.CategoryDto;
import com.example.FirstCopy.entity.Category;
import com.example.FirstCopy.repository.CategoryRepository;
import com.example.FirstCopy.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository repository;

    @Override
    public CategoryDto createCategory(CategoryDto dto) {

        if (repository.existsByNameAndGender(dto.getName(), dto.getGender())) {
            throw new RuntimeException("Category already exists");
        }

        Category category = Category.builder()
                .name(dto.getName())
                .gender(dto.getGender())
                .build();

        repository.save(category);

        dto.setId(category.getId());

        return dto;
    }

    @Override
    public List<CategoryDto> getAllCategories() {

        return repository.findAll()
                .stream()
                .map(category -> CategoryDto.builder()
                        .id(category.getId())
                        .name(category.getName())
                        .gender(category.getGender())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public CategoryDto getCategoryById(Long id) {

        Category category = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .gender(category.getGender())
                .build();
    }

    @Override
    public CategoryDto updateCategory(Long id, CategoryDto dto) {

        Category category = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        category.setName(dto.getName());
        category.setGender(dto.getGender());

        repository.save(category);

        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .gender(category.getGender())
                .build();
    }

    @Override
    public void deleteCategory(Long id) {

        repository.deleteById(id);
    }
}