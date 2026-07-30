package com.example.FirstCopy.ServiceImpl;


import com.example.FirstCopy.dto.PincodeDTO;
import com.example.FirstCopy.service.PincodeService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;


@Service
@RequiredArgsConstructor
public class PincodeServiceImpl implements PincodeService {


    private final RestTemplate restTemplate;


    @Override
    public PincodeDTO getPincodeDetails(String pincode) {


        String url =
                "https://api.postalpincode.in/pincode/" + pincode;


        List<?> response;

        try {

            response = restTemplate.getForObject(
                    url,
                    List.class
            );

        }
        catch(Exception e){

            e.printStackTrace();

            throw new RuntimeException(
                    "Postal API connection failed"
            );

        }


        if(response == null || response.isEmpty()){
            throw new RuntimeException("Invalid Pincode");
        }


        Map<String,Object> result =
                (Map<String,Object>) response.get(0);



        String status =
                (String) result.get("Status");


        if(!"Success".equals(status)){
            throw new RuntimeException("Pincode not found");
        }



        List<Map<String,Object>> offices =
                (List<Map<String,Object>>) result.get("PostOffice");



        Map<String,Object> office =
                offices.get(0);



        return PincodeDTO.builder()

                .pincode(pincode)

                .city(
                        office.get("District").toString()
                )

                .state(
                        office.get("State").toString()
                )

                .country(
                        office.get("Country").toString()
                )

                .build();

    }

}