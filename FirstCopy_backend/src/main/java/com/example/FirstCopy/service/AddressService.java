package com.example.FirstCopy.service;

import com.example.FirstCopy.dto.AddressDTO;

import java.util.List;

public interface AddressService {

    // Add new address
    AddressDTO addAddress(AddressDTO addressDTO);

    // Get all addresses of a user
    List<AddressDTO> getUserAddresses(Long userId);

    // Get address by id
    AddressDTO getAddressById(Long id);

    // Update address
    AddressDTO updateAddress(Long id, AddressDTO addressDTO);

    // Delete address
    void deleteAddress(Long id);

    // Set default address
    AddressDTO setDefaultAddress(Long userId, Long addressId);
}