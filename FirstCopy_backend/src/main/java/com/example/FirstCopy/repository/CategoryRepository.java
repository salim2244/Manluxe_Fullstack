package com.example.FirstCopy.repository;

import com.example.FirstCopy.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByName(String name);

    Optional<Category> findByNameAndGender(String name, String gender);

    boolean existsByNameAndGender(String name, String gender);

    List<Category> findByGender(String gender);
}