package com.example.FirstCopy.service;

import com.example.FirstCopy.dto.CartResponse;

public interface CartService {

    CartResponse addToCart(Long productId, Integer quantity, String size);

    CartResponse getCart();

    CartResponse updateQuantity(Long cartItemId, Integer quantity);

    void removeItem(Long cartItemId);

    void clearCart();

}