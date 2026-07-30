package com.example.FirstCopy.service;

import com.example.FirstCopy.dto.AuthResponse;
import com.example.FirstCopy.dto.LoginRequest;
import com.example.FirstCopy.dto.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}