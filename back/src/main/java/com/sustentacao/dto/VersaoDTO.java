package com.sustentacao.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class VersaoDTO {
    private Long id;
    private String numeroVersao;
    private LocalDate dataCadastro;
    private String descricao;
}
