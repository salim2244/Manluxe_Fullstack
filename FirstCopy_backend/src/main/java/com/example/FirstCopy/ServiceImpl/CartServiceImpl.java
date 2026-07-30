package com.example.FirstCopy.ServiceImpl;

import com.example.FirstCopy.config.SecurityUtil;
import com.example.FirstCopy.dto.CartItemResponse;
import com.example.FirstCopy.dto.CartResponse;
import com.example.FirstCopy.entity.*;
import com.example.FirstCopy.exception.ResourceNotFoundException;
import com.example.FirstCopy.repository.CartItemRepository;
import com.example.FirstCopy.repository.CartRepository;
import com.example.FirstCopy.repository.ProductRepository;
import com.example.FirstCopy.repository.UserRepository;
import com.example.FirstCopy.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    public CartResponse addToCart(Long productId, Integer quantity, String size) {

        String email = SecurityUtil.getCurrentUserEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));


        ProductSize selectedSize = product.getSizes()
                .stream()
                .filter(s -> s.getSize().equals(size))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Size not found"));


        Cart cart = cartRepository.findByUser(user).orElse(null);

        if (cart == null) {

            cart = new Cart();
            cart.setUser(user);
            cart.setItems(new ArrayList<>());

            cart = cartRepository.save(cart);
        }


        CartItem cartItem = cartItemRepository
                .findByCartAndProductAndSize(cart, product, size)
                .orElse(null);


        int newQty = quantity;


        if(cartItem != null){
            newQty = cartItem.getQuantity() + quantity;
        }


        Integer totalCartQuantity =
                cartItemRepository.getTotalQuantityInCart(
                        productId,
                        size
                );


        int availableStock =
                selectedSize.getStock() - totalCartQuantity;


        if(quantity > availableStock){

            throw new RuntimeException(
                    "Only " + availableStock +
                            " items available for size " + size
            );
        }



        if(cartItem == null){

            cartItem = new CartItem();

            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setQuantity(quantity);
            cartItem.setPrice(product.getPrice());
            cartItem.setSize(size);

            cart.getItems().add(cartItem);

        }
        else{

            cartItem.setQuantity(newQty);
            cartItem.setPrice(product.getPrice());

        }


        cartRepository.save(cart);


        return getCart();
    }

    @Override
    public CartResponse getCart() {

        String email = SecurityUtil.getCurrentUserEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Cart is empty"));

        List<CartItemResponse> itemResponses = new ArrayList<>();

        double grandTotal = 0;

        for (CartItem item : cart.getItems()) {

            double total = item.getPrice() * item.getQuantity();
            grandTotal += total;

            ProductSize selectedSize = item.getProduct().getSizes()
                    .stream()
                    .filter(s -> s.getSize().equals(item.getSize()))
                    .findFirst()
                    .orElse(null);

            itemResponses.add(
                    CartItemResponse.builder()
                            .cartItemId(item.getId())
                            .productId(item.getProduct().getId())
                            .productName(item.getProduct().getName())
                            .price(item.getPrice())
                            .quantity(item.getQuantity())
                            .totalPrice(total)
                            .imageUrl(item.getProduct().getImageUrl())
                            .brand(item.getProduct().getBrand())
                            .size(item.getSize())
                            .remainingStock(selectedSize != null ? selectedSize.getStock() - item.getQuantity() : 0)
                            .build()
            );
        }

        return CartResponse.builder()
                .cartId(cart.getId())
                .items(itemResponses)
                .grandTotal(grandTotal)
                .build();
    }

    @Override
    public CartResponse updateQuantity(Long cartItemId, Integer quantity) {


        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cart item not found")
                );


        if(quantity <= 0){

            cartItemRepository.delete(cartItem);

            return getCart();
        }



        ProductSize selectedSize = cartItem.getProduct()
                .getSizes()
                .stream()
                .filter(s -> s.getSize().equals(cartItem.getSize()))
                .findFirst()
                .orElseThrow(() ->
                        new ResourceNotFoundException("Size not found")
                );



        if(quantity > selectedSize.getStock()){

            throw new RuntimeException(
                    "Only " + selectedSize.getStock() +
                            " items available"
            );
        }



        cartItem.setQuantity(quantity);


        cartItemRepository.save(cartItem);


        return getCart();
    }

    @Override
    public void removeItem(Long cartItemId) {


        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cart item not found")
                );


        cartItemRepository.delete(cartItem);
    }

    @Override
    public void clearCart() {


        String email = SecurityUtil.getCurrentUserEmail();


        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );



        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cart not found")
                );



        cartItemRepository.deleteByCart(cart);


        cart.getItems().clear();


        cartRepository.save(cart);
    }
}