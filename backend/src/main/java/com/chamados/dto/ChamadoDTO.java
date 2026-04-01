package com.chamados.dto;

import com.chamados.model.Prioridade;
import com.chamados.model.Status;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChamadoDTO {

    private Long id;

    @NotBlank(message = "Título é obrigatório")
    @Size(max = 255, message = "Título deve ter no máximo 255 caracteres")
    private String titulo;

    @NotBlank(message = "Descrição é obrigatória")
    private String descricao;

    private Status status;

    private Prioridade prioridade;

    private String categoria;

    @NotBlank(message = "Solicitante é obrigatório")
    private String solicitante;

    private String responsavel;

    private LocalDateTime dataAbertura;

    private LocalDateTime dataFechamento;
}
