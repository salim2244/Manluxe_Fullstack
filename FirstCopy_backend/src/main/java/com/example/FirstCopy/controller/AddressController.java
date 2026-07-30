package com.example.FirstCopy.controller;

import com.example.FirstCopy.dto.AddressDTO;
import com.example.FirstCopy.service.AddressService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class AddressController {


    private final AddressService addressService;


    // Add new address
    @PostMapping
    public ResponseEntity<AddressDTO> addAddress(
            @RequestBody AddressDTO addressDTO) {

        AddressDTO savedAddress = addressService.addAddress(addressDTO);

        return new ResponseEntity<>(savedAddress, HttpStatus.CREATED);
    }


    // Get all addresses of user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AddressDTO>> getUserAddresses(
            @PathVariable Long userId) {

        List<AddressDTO> addresses = addressService.getUserAddresses(userId);

        return ResponseEntity.ok(addresses);
    }


    // Get address by id
    @GetMapping("/{id}")
    public ResponseEntity<AddressDTO> getAddressById(
            @PathVariable Long id) {

        AddressDTO address = addressService.getAddressById(id);

        return ResponseEntity.ok(address);
    }


    // Update address
    @PutMapping("/{id}")
    public ResponseEntity<AddressDTO> updateAddress(
            @PathVariable Long id,
            @RequestBody AddressDTO addressDTO) {

        AddressDTO updatedAddress =
                addressService.updateAddress(id, addressDTO);

        return ResponseEntity.ok(updatedAddress);
    }


    // Delete address
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAddress(
            @PathVariable Long id) {

        addressService.deleteAddress(id);

        return ResponseEntity.ok("Address deleted successfully");
    }


    // Set default address
    @PutMapping("/default/{userId}/{addressId}")
    public ResponseEntity<AddressDTO> setDefaultAddress(
            @PathVariable Long userId,
            @PathVariable Long addressId) {

        AddressDTO address =
                addressService.setDefaultAddress(userId, addressId);

        return ResponseEntity.ok(address);
    }
}