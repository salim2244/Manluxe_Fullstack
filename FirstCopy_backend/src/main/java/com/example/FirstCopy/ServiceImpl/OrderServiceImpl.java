package com.example.FirstCopy.ServiceImpl;

import com.example.FirstCopy.config.SecurityUtil;
import com.example.FirstCopy.dto.OrderItemResponse;
import com.example.FirstCopy.dto.OrderResponse;
import com.example.FirstCopy.entity.*;
import com.example.FirstCopy.exception.BadRequestException;
import com.example.FirstCopy.exception.ResourceNotFoundException;
import com.example.FirstCopy.repository.*;
import com.example.FirstCopy.service.OrderService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    @Override
    public OrderResponse checkout() {

        String email = SecurityUtil.getCurrentUserEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));


        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));


        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }


        double grandTotal = 0;


        Order order = new Order();

        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);
        order.setTotalPrice(0.0);

        order = orderRepository.save(order);



        List<OrderItemResponse> responseItems = new ArrayList<>();


        for (CartItem cartItem : cart.getItems()) {


            Product product = cartItem.getProduct();



            // only check size stock
            ProductSize productSize = product.getSizes()
                    .stream()
                    .filter(size ->
                            size.getSize().equals(cartItem.getSize()))
                    .findFirst()
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Size not found"));



            // validate available stock
            if(productSize.getStock() < cartItem.getQuantity()) {

                throw new BadRequestException(
                        product.getName()
                                + " size "
                                + cartItem.getSize()
                                + " only "
                                + productSize.getStock()
                                + " available"
                );
            }



            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .price(cartItem.getPrice())
                    .size(cartItem.getSize())
                    .build();



            order.getItems().add(orderItem);



            double total =
                    cartItem.getPrice()
                            * cartItem.getQuantity();


            grandTotal += total;



            responseItems.add(
                    OrderItemResponse.builder()
                            .productId(product.getId())
                            .productName(product.getName())
                            .brand(product.getBrand())
                            .imageUrl(product.getImageUrl())
                            .price(cartItem.getPrice())
                            .quantity(cartItem.getQuantity())
                            .total(total)
                            .build()
            );
        }



        order.setTotalPrice(grandTotal);

        orderRepository.save(order);



        // IMPORTANT
        // Do not reduce stock here
        // Do not clear cart here



        return OrderResponse.builder()
                .id(order.getId())
                .orderId(order.getId())

                .userId(user.getId())
                .userName(
                        user.getFirstName()
                                + " "
                                + user.getLastName()
                )
                .userEmail(user.getEmail())

                .totalPrice(grandTotal)
                .totalAmount(grandTotal)

                .status(order.getStatus())

                .createdAt(order.getCreatedAt())
                .updatedAt(order.getCreatedAt())

                .items(responseItems)

                .build();
    }

    @Override
    public List<OrderResponse> myOrders() {

        String email = SecurityUtil.getCurrentUserEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return orderRepository.findByUser(user)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public OrderResponse getOrder(Long id) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        return mapToResponse(order);
    }

    @Override
    public List<OrderResponse> getAllOrders() {

        return orderRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public OrderResponse updateStatus(Long id, String status) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        order.setStatus(OrderStatus.valueOf(status.toUpperCase()));

        orderRepository.save(order);

        return mapToResponse(order);
    }

    private OrderResponse mapToResponse(Order order) {

        List<OrderItemResponse> items = order.getItems()
                .stream()
                .map(item -> OrderItemResponse.builder()
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .brand(item.getProduct().getBrand())
                        .imageUrl(item.getProduct().getImageUrl())
                        .price(item.getPrice())
                        .quantity(item.getQuantity())
                        .total(item.getPrice() * item.getQuantity())
                        .build())
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .orderId(order.getId())
                .userId(order.getUser().getId())
                .userName(order.getUser().getFirstName() + " " + order.getUser().getLastName())
                .userEmail(order.getUser().getEmail())
                .totalPrice(order.getTotalPrice())
                .totalAmount(order.getTotalPrice())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getCreatedAt())   // or remove this if you removed the field
                .items(items)
                .build();
    }
}
