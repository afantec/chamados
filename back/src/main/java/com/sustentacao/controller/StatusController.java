package com.sustentacao.controller;

import com.sustentacao.dto.StatusDTO;
import com.sustentacao.service.StatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/status")
@RequiredArgsConstructor
public class StatusController {

    private final StatusService service;

    @GetMapping
    public List<StatusDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public ResponseEntity<StatusDTO> buscarPorId(@PathVariable("id") Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<StatusDTO> salvar(@RequestBody StatusDTO dto) {
        return ResponseEntity.status(201).body(service.salvar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StatusDTO> atualizar(@PathVariable("id") Long id, @RequestBody StatusDTO dto) {
        return ResponseEntity.ok(service.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable("id") Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
