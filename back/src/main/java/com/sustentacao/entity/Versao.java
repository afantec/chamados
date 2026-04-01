package com.sustentacao.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "versao")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Versao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String numeroVersao;

    @Column(nullable = false)
    private LocalDate dataCadastro;

    @Column(length = 500)
    private String descricao;
}
