package com.example.FirstCopy.repository;

import com.example.FirstCopy.entity.Cart;
import com.example.FirstCopy.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByUser(User user);

}