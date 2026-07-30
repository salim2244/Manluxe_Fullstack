package com.example.FirstCopy.ServiceImpl;

import com.example.FirstCopy.config.JwtService;
import com.example.FirstCopy.dto.AuthResponse;
import com.example.FirstCopy.dto.LoginRequest;
import com.example.FirstCopy.dto.RegisterRequest;
import com.example.FirstCopy.entity.Role;
import com.example.FirstCopy.entity.User;
import com.example.FirstCopy.repository.UserRepository;
import com.example.FirstCopy.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .address(request.getAddress())
                .role(Role.USER)
                .build();

        userRepository.save(user);

//        String token = jwtService.generateToken(user);
//
//        return AuthResponse.builder()
//                .token(token)
//                .message("Registration Successful")
//                .name(user.getFirstName())
//                .email(user.getEmail())
//                .build();
        return AuthResponse.builder()
                .message("Registration Successful")
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .message("Login Successful")
                .name(user.getFirstName())
                .email(user.getEmail())
                .userId(user.getId())
                .build();
    }
}