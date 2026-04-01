package com.sustentacao.controller;

import com.sustentacao.dto.DesenvolvedorDTO;
import com.sustentacao.service.DesenvolvedorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/desenvolvedores")
@RequiredArgsConstructor
public class DesenvolvedorController {

    private final DesenvolvedorService service;

    @GetMapping
    public List<DesenvolvedorDTO> listar() {
        return service.listar();
    }

    @GetMapping("/ativos")
    public List<DesenvolvedorDTO> listarAtivos() {
        return service.listarAtivos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DesenvolvedorDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<DesenvolvedorDTO> salvar(@RequestBody DesenvolvedorDTO dto) {
        return ResponseEntity.status(201).body(service.salvar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DesenvolvedorDTO> atualizar(@PathVariable Long id, @RequestBody DesenvolvedorDTO dto) {
        return ResponseEntity.ok(service.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
