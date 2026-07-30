package com.example.FirstCopy.ServiceImpl;

import org.springframework.transaction.annotation.Transactional;
import com.example.FirstCopy.entity.ProductSize;
import com.example.FirstCopy.dto.ProductSizeRequest;
import com.example.FirstCopy.dto.ProductSizeResponse;
import com.example.FirstCopy.repository.ProductSizeRepository;
import com.example.FirstCopy.dto.ProductRequest;
import com.example.FirstCopy.dto.ProductResponse;
import com.example.FirstCopy.entity.Category;
import com.example.FirstCopy.entity.Product;
import com.example.FirstCopy.repository.CategoryRepository;
import com.example.FirstCopy.repository.ProductRepository;
import com.example.FirstCopy.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.example.FirstCopy.exception.ResourceNotFoundException;
import java.util.List;
import com.example.FirstCopy.entity.Gender;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductSizeRepository productSizeRepository;

    @Override
    @Transactional
    public ProductResponse addProduct(ProductRequest request) {

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .discount(request.getDiscount() == null ? 0.0 : request.getDiscount())
                .stock(0)
                .brand(request.getBrand())
                .imageUrl(request.getImageUrl())
                .gender(Gender.valueOf(category.getGender()))
                .active(request.getActive() == null ? true : request.getActive())
                .category(category)
                .sizeType(request.getSizeType())
                .build();

        Product saved = productRepository.save(product);

        if (request.getSizes() != null) {

            for (ProductSizeRequest s : request.getSizes()) {

                ProductSize size = ProductSize.builder()
                        .product(saved)
                        .size(s.getSize())
                        .stock(s.getStock())
                        .build();

                productSizeRepository.save(size);
            }

        }

        if (request.getSizes() != null && !request.getSizes().isEmpty()) {

            int totalStock = request.getSizes()
                    .stream()
                    .mapToInt(ProductSizeRequest::getStock)
                    .sum();

            saved.setStock(totalStock);
            productRepository.save(saved);
        }

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setDiscount(request.getDiscount());
        product.setStock(0);
        product.setBrand(request.getBrand());
        product.setGender(Gender.valueOf(category.getGender()));
        product.setImageUrl(request.getImageUrl());
        product.setCategory(category);
        product.setActive(request.getActive());
        product.setSizeType(request.getSizeType());

        Product updated = productRepository.save(product);

        // Delete old sizes
        productSizeRepository.deleteByProductId(updated.getId());

        // Save new sizes
        if (request.getSizes() != null) {

            for (ProductSizeRequest s : request.getSizes()) {

                ProductSize size = ProductSize.builder()
                        .product(updated)
                        .size(s.getSize())
                        .stock(s.getStock())
                        .build();

                productSizeRepository.save(size);
            }

        }

        if (request.getSizes() != null && !request.getSizes().isEmpty()) {

            int totalStock = request.getSizes()
                    .stream()
                    .mapToInt(ProductSizeRequest::getStock)
                    .sum();

            updated.setStock(totalStock);
            productRepository.save(updated);
        }

        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        productRepository.delete(product);
    }

    @Override
    public ProductResponse getProductById(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        return mapToResponse(product);
    }

    @Override
    public List<ProductResponse> getAllProducts() {

        return productRepository.findByActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<ProductResponse> getProductsByCategory(Long categoryId) {

        return productRepository.findByCategoryId(categoryId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<ProductResponse> searchProducts(String keyword) {

        return productRepository.findByNameContainingIgnoreCase(keyword)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private ProductResponse mapToResponse(Product product) {

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .discount(product.getDiscount())
                .stock(product.getStock())
                .brand(product.getBrand())
                .gender(product.getGender())
                .imageUrl(product.getImageUrl())
                .active(product.getActive())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .sizeType(product.getSizeType())

                .sizes(

                        productSizeRepository.findByProductId(product.getId())

                                .stream()

                                .map(s -> ProductSizeResponse.builder()
                                        .id(s.getId())
                                        .size(s.getSize())
                                        .stock(s.getStock())
                                        .build())

                                .toList()

                )

                .build();
    }
}