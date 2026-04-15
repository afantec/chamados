package com.sustentacao.controller;

import com.sustentacao.dto.AlertaTarefaDTO;
import com.sustentacao.dto.AlertaTarefaRequestDTO;
import com.sustentacao.service.AlertaTarefaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alertas")
@RequiredArgsConstructor
public class AlertaTarefaController {

    private final AlertaTarefaService service;

    @GetMapping("/ativos")
    public List<AlertaTarefaDTO> listarAtivos() {
        return service.listarAtivos();
    }

    @GetMapping("/tarefa/{tarefaId}")
    public List<AlertaTarefaDTO> listarPorTarefa(@PathVariable("tarefaId") Long tarefaId) {
        return service.listarPorTarefa(tarefaId);
    }

    @PostMapping
    public ResponseEntity<AlertaTarefaDTO> salvar(@Valid @RequestBody AlertaTarefaRequestDTO dto) {
        return ResponseEntity.status(201).body(service.salvar(dto));
    }

    @PatchMapping("/{id}/desativar")
    public ResponseEntity<AlertaTarefaDTO> desativar(@PathVariable("id") Long id) {
        return ResponseEntity.ok(service.desativar(id));
    }
}
