package com.sustentacao.controller;

import com.sustentacao.dto.TarefaDTO;
import com.sustentacao.dto.TarefaRequestDTO;
import com.sustentacao.service.TarefaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tarefas")
@RequiredArgsConstructor
public class TarefaController {

    private final TarefaService service;

    @GetMapping
    public List<TarefaDTO> listar(
            @RequestParam(required = false) String descricao,
            @RequestParam(required = false) Long statusId,
            @RequestParam(required = false) Long desenvolvedorId,
            @RequestParam(required = false) Long tipoId,
            @RequestParam(required = false) Long versaoId) {

        if (descricao != null || statusId != null || desenvolvedorId != null || tipoId != null || versaoId != null) {
            return service.filtrar(descricao, statusId, desenvolvedorId, tipoId, versaoId);
        }
        return service.listar();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TarefaDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<TarefaDTO> salvar(@Valid @RequestBody TarefaRequestDTO dto) {
        return ResponseEntity.status(201).body(service.salvar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TarefaDTO> atualizar(@PathVariable Long id, @Valid @RequestBody TarefaRequestDTO dto) {
        return ResponseEntity.ok(service.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
