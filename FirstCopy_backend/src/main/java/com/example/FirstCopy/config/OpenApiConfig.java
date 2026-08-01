package com.example.FirstCopy.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "ManLuxe E-Commerce API",
                version = "1.0",
                description = "REST APIs for ManLuxe E-Commerce Application",
                contact = @Contact(
                        name = "Salim Ansari",
                        email = "salimansari8308@gmail.com"
                )
        )
)
public class OpenApiConfig {
}