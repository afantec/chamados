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
        List<DesenvolvedorDTO> lista = service.listar();
        lista.sort((a, b) -> a.getNome().compareTo(b.getNome()));
        return lista;
    }

    @GetMapping("/ativos")
    public List<DesenvolvedorDTO> listarAtivos() {
        List<DesenvolvedorDTO> lista = service.listarAtivos();
        lista.sort((a, b) -> a.getNome().compareTo(b.getNome()));
        return lista;
    }

    @GetMapping("/{id}")
    public ResponseEntity<DesenvolvedorDTO> buscarPorId(@PathVariable("id") Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<DesenvolvedorDTO> salvar(@RequestBody DesenvolvedorDTO dto) {
        return ResponseEntity.status(201).body(service.salvar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DesenvolvedorDTO> atualizar(@PathVariable("id") Long id, @RequestBody DesenvolvedorDTO dto) {
        return ResponseEntity.ok(service.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable("id") Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
