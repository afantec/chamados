package com.sustentacao.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AnotacaoDTO {
    private Long id;
    private String descricao;
    private LocalDateTime dataAnotacao;
    private Long tarefaId;
}
