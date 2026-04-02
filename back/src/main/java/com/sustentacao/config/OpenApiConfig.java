package com.sustentacao.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI sustentacaoOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Sustentacao API")
                        .description("API REST para gestao de demandas da area de sustentacao")
                        .version("v1")
                        .contact(new Contact().name("Time de Sustentacao"))
                        .license(new License().name("Uso interno")));
    }
}
