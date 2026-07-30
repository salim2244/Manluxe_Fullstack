package com.example.FirstCopy.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import jakarta.validation.constraints.Pattern;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank
    private String firstName;

    private String lastName;



    @NotBlank(message = "Email is required")
    @Pattern(
            regexp = "^[A-Za-z0-9._%+-]+@(gmail|yahoo|hotmail|outlook)\\.com$",
            message = "Please enter a valid email address"
    )
    private String email;

    @NotBlank
    private String password;

    private String phone;

    private String address;
}