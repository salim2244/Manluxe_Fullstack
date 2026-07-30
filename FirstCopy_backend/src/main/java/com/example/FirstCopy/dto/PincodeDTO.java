package com.example.FirstCopy.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PincodeDTO {

    private String pincode;

    private String city;

    private String state;

    private String country;
}