package com.chamados.controller;

import com.chamados.dto.ChamadoDTO;
import com.chamados.model.Status;
import com.chamados.service.ChamadoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chamados")
@RequiredArgsConstructor
public class ChamadoController {

    private final ChamadoService chamadoService;

    @GetMapping
    public ResponseEntity<List<ChamadoDTO>> findAll() {
        return ResponseEntity.ok(chamadoService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChamadoDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(chamadoService.findById(id));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ChamadoDTO>> findByStatus(@PathVariable Status status) {
        return ResponseEntity.ok(chamadoService.findByStatus(status));
    }

    @PostMapping
    public ResponseEntity<ChamadoDTO> create(@Valid @RequestBody ChamadoDTO dto) {
        ChamadoDTO created = chamadoService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChamadoDTO> update(@PathVariable Long id, @Valid @RequestBody ChamadoDTO dto) {
        return ResponseEntity.ok(chamadoService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        chamadoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
