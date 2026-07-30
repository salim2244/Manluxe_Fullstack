package com.example.FirstCopy.ServiceImpl;

import com.example.FirstCopy.dto.AddressDTO;
import com.example.FirstCopy.entity.Address;
import com.example.FirstCopy.entity.User;
import com.example.FirstCopy.repository.AddressRepository;
import com.example.FirstCopy.repository.UserRepository;
import com.example.FirstCopy.service.AddressService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {


    private final AddressRepository addressRepository;
    private final UserRepository userRepository;


    @Override
    public AddressDTO addAddress(AddressDTO addressDTO) {

        User user = userRepository.findById(addressDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));


        Address address = Address.builder()
                .user(user)
                .fullName(addressDTO.getFullName())
                .phone(addressDTO.getPhone())
                .addressLine1(addressDTO.getAddressLine1())
                .addressLine2(addressDTO.getAddressLine2())
                .city(addressDTO.getCity())
                .state(addressDTO.getState())
                .pincode(addressDTO.getPincode())
                .defaultAddress(addressDTO.isDefaultAddress())
                .build();


        Address savedAddress = addressRepository.save(address);

        return convertToDTO(savedAddress);
    }


    @Override
    public List<AddressDTO> getUserAddresses(Long userId) {

        return addressRepository.findByUserId(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }


    @Override
    public AddressDTO getAddressById(Long id) {

        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        return convertToDTO(address);
    }


    @Override
    public AddressDTO updateAddress(Long id, AddressDTO addressDTO) {

        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found"));


        address.setFullName(addressDTO.getFullName());
        address.setPhone(addressDTO.getPhone());
        address.setAddressLine1(addressDTO.getAddressLine1());
        address.setAddressLine2(addressDTO.getAddressLine2());
        address.setCity(addressDTO.getCity());
        address.setState(addressDTO.getState());
        address.setPincode(addressDTO.getPincode());
        address.setDefaultAddress(addressDTO.isDefaultAddress());


        Address updatedAddress = addressRepository.save(address);

        return convertToDTO(updatedAddress);
    }


    @Override
    public void deleteAddress(Long id) {

        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        addressRepository.delete(address);
    }


    @Override
    public AddressDTO setDefaultAddress(Long userId, Long addressId) {

        List<Address> addresses = addressRepository.findByUserId(userId);


        for(Address address : addresses){
            address.setDefaultAddress(false);
        }

        addressRepository.saveAll(addresses);


        Address defaultAddress = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));


        defaultAddress.setDefaultAddress(true);

        Address savedAddress = addressRepository.save(defaultAddress);

        return convertToDTO(savedAddress);
    }


    private AddressDTO convertToDTO(Address address){

        return AddressDTO.builder()
                .id(address.getId())
                .fullName(address.getFullName())
                .phone(address.getPhone())
                .addressLine1(address.getAddressLine1())
                .addressLine2(address.getAddressLine2())
                .city(address.getCity())
                .state(address.getState())
                .pincode(address.getPincode())
                .defaultAddress(address.getDefaultAddress())
                .userId(
                        address.getUser() != null
                                ? address.getUser().getId()
                                : null
                )
                .build();
    }
}