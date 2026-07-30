package com.example.FirstCopy.controller;


import com.example.FirstCopy.dto.PincodeDTO;
import com.example.FirstCopy.service.PincodeService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/pincode")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class PincodeController {


    private final PincodeService pincodeService;


    @GetMapping("/{pincode}")
    public ResponseEntity<PincodeDTO> getPincodeDetails(
            @PathVariable String pincode){


        return ResponseEntity.ok(
                pincodeService.getPincodeDetails(pincode)
        );

    }

}