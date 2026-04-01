package com.sustentacao.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TarefaRequestDTO {

    @NotBlank(message = "Código é obrigatório")
    private String codigo;

    @NotBlank(message = "Descrição é obrigatória")
    private String descricao;

    @NotNull(message = "Tipo é obrigatório")
    private Long tipoId;

    private Long desenvolvedorId;

    @NotNull(message = "Status é obrigatório")
    private Long statusId;

    private Long versaoId;

    @NotNull(message = "Prioridade é obrigatória")
    @Min(value = 1, message = "Prioridade mínima é 1")
    @Max(value = 10, message = "Prioridade máxima é 10")
    private Integer prioridade;

    @Min(value = 0, message = "Percentual mínimo é 0")
    @Max(value = 100, message = "Percentual máximo é 100")
    private Integer percentualCompleto = 0;

    private String branchNome;

    private LocalDate dataEntrega;

    private LocalDate dataFinalizacao;

    private String ambiente;
}
