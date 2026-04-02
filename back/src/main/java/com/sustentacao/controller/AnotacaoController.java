package com.sustentacao.controller;

import com.sustentacao.dto.AnotacaoDTO;
import com.sustentacao.dto.AnotacaoRequestDTO;
import com.sustentacao.service.AnotacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/anotacoes")
@RequiredArgsConstructor
public class AnotacaoController {

    private final AnotacaoService service;

    @GetMapping("/tarefa/{tarefaId}")
    public List<AnotacaoDTO> listarPorTarefa(@PathVariable("tarefaId") Long tarefaId) {
        return service.listarPorTarefa(tarefaId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnotacaoDTO> buscarPorId(@PathVariable("id") Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<AnotacaoDTO> salvar(@Valid @RequestBody AnotacaoRequestDTO dto) {
        return ResponseEntity.status(201).body(service.salvar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AnotacaoDTO> atualizar(@PathVariable("id") Long id, @Valid @RequestBody AnotacaoRequestDTO dto) {
        return ResponseEntity.ok(service.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable("id") Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
