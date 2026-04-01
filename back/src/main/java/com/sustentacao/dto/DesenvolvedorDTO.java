package com.sustentacao.dto;

import lombok.Data;

@Data
public class DesenvolvedorDTO {
    private Long id;
    private String nome;
    private String email;
    private Boolean ativo;
}
