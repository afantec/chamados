package com.sustentacao.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TarefaDTO {
    private Long id;
    private String codigo;
    private String descricao;
    private TipoDTO tipo;
    private DesenvolvedorDTO desenvolvedor;
    private StatusDTO status;
    private VersaoDTO versao;
    private Integer prioridade;
    private Integer percentualCompleto;
    private String branchNome;
    private LocalDateTime dataCriacao;
    private LocalDate dataEntrega;
    private LocalDate dataFinalizacao;
    private String ambiente;
    private List<AnotacaoDTO> anotacoes;
}
