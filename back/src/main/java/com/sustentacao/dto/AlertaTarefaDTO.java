package com.sustentacao.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AlertaTarefaDTO {
    private Long id;
    private Long tarefaId;
    private String tarefaCodigo;
    private String tarefaDescricao;
    private String message;
    private Boolean active;
    private LocalDateTime createdAt;
}
