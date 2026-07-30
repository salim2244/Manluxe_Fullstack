package com.example.FirstCopy.repository;

import com.example.FirstCopy.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AddressRepository extends JpaRepository<Address, Long> {


    List<Address> findByUserId(Long userId);


    Optional<Address> findByUserIdAndDefaultAddressTrue(Long userId);

}
