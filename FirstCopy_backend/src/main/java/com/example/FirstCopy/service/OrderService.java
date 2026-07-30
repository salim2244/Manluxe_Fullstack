package com.example.FirstCopy.service;

import com.example.FirstCopy.dto.OrderResponse;
import java.util.List;

public interface OrderService {

    OrderResponse checkout();

    List<OrderResponse> myOrders();

    OrderResponse getOrder(Long id);

    List<OrderResponse> getAllOrders();

    OrderResponse updateStatus(Long id, String status);
}
