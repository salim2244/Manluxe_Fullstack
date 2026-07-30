package com.example.FirstCopy.repository;

import com.example.FirstCopy.entity.Product;
import com.example.FirstCopy.entity.ProductSize;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductSizeRepository extends JpaRepository<ProductSize, Long> {

    List<ProductSize> findByProductId(Long productId);

    void deleteByProductId(Long productId);

    Optional<ProductSize> findByProductAndSize(
            Product product,
            String size
    );
}