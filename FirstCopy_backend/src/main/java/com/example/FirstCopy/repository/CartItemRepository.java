package com.example.FirstCopy.repository;

import com.example.FirstCopy.entity.Cart;
import com.example.FirstCopy.entity.CartItem;
import com.example.FirstCopy.entity.Product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {


    Optional<CartItem> findByCartAndProductAndSize(
            Cart cart,
            Product product,
            String size
    );


    @Query("""
        SELECT COALESCE(SUM(c.quantity), 0)
        FROM CartItem c
        WHERE c.product.id = :productId
        AND c.size = :size
    """)
    Integer getTotalQuantityInCart(
            @Param("productId") Long productId,
            @Param("size") String size
    );


    @Modifying
    @Transactional
    @Query("DELETE FROM CartItem c WHERE c.cart = :cart")
    void deleteByCart(@Param("cart") Cart cart);

}