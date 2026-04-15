package com.sustentacao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AlertaTarefaRequestDTO {

    @NotBlank(message = "Mensagem do alerta é obrigatória")
    private String message;

    @NotNull(message = "Tarefa é obrigatória")
    private Long tarefaId;
}
