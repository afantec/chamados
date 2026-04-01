package com.chamados.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "chamados")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Chamado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Título é obrigatório")
    @Size(max = 255, message = "Título deve ter no máximo 255 caracteres")
    @Column(nullable = false, length = 255)
    private String titulo;

    @NotBlank(message = "Descrição é obrigatória")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.ABERTO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Prioridade prioridade = Prioridade.MEDIA;

    @Column(length = 100)
    private String categoria;

    @NotBlank(message = "Solicitante é obrigatório")
    @Column(nullable = false, length = 255)
    private String solicitante;

    @Column(length = 255)
    private String responsavel;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime dataAbertura;

    @Column
    private LocalDateTime dataFechamento;
}
