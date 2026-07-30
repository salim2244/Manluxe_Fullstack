package com.example.FirstCopy.repository;

import com.example.FirstCopy.entity.Order;
import com.example.FirstCopy.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order,Long> {

    List<Order> findByUser(User user);

}