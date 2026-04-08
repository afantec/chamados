package com.sustentacao.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ArquivoDTO {
    private Long id;
    private Long tarefaId;
    private String nomeOriginal;
    private Long tamanhoBytes;
    private String contentType;
    private String extensao;
    private LocalDateTime dataUpload;
}
