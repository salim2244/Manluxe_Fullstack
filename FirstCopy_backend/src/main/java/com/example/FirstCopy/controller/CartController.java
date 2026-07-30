package com.example.FirstCopy.controller;

import com.example.FirstCopy.dto.CartResponse;
import com.example.FirstCopy.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    // Add Product to Cart
    @PostMapping("/add/{productId}")
    public ResponseEntity<CartResponse> addToCart(
            @PathVariable Long productId,
            @RequestParam Integer quantity,
            @RequestParam(required = false) String size) {

        return ResponseEntity.ok(
                cartService.addToCart(productId, quantity, size));
    }

    // Get Cart
    @GetMapping
    public ResponseEntity<CartResponse> getCart() {

        return ResponseEntity.ok(cartService.getCart());
    }

    // Update Quantity
    @PutMapping("/update/{cartItemId}")
    public ResponseEntity<CartResponse> updateQuantity(
            @PathVariable Long cartItemId,
            @RequestParam Integer quantity) {

        return ResponseEntity.ok(
                cartService.updateQuantity(cartItemId, quantity));
    }

    // Remove Item
    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<String> removeItem(
            @PathVariable Long cartItemId) {

        cartService.removeItem(cartItemId);

        return ResponseEntity.ok("Item removed successfully.");
    }

    // Clear Cart
    @DeleteMapping("/clear")
    public ResponseEntity<String> clearCart() {

        cartService.clearCart();

        return ResponseEntity.ok("Cart cleared successfully.");
    }

}