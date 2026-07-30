package com.example.FirstCopy.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;


@Configuration
public class RestTemplateConfig {


    @Bean
    public RestTemplate restTemplate() {


        SimpleClientHttpRequestFactory factory =
                new SimpleClientHttpRequestFactory();


        factory.setConnectTimeout(15000);
        factory.setReadTimeout(15000);


        RestTemplate restTemplate =
                new RestTemplate(factory);


        restTemplate.getInterceptors()
                .add((request, body, execution) -> {

                    request.getHeaders()
                            .add("User-Agent", "Mozilla/5.0");

                    return execution.execute(request, body);

                });


        return restTemplate;

    }

}