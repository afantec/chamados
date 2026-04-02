package com.sustentacao.controller;

import com.sustentacao.dto.TarefaDTO;
import com.sustentacao.dto.TarefaRequestDTO;
import com.sustentacao.service.TarefaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tarefas")
@RequiredArgsConstructor
public class TarefaController {

    private final TarefaService service;

    @GetMapping
    public List<TarefaDTO> listar(
            @RequestParam(name = "descricao", required = false) String descricao,
            @RequestParam(name = "statusId", required = false) String statusId,
            @RequestParam(name = "desenvolvedorId", required = false) String desenvolvedorId,
            @RequestParam(name = "tipoId", required = false) String tipoId,
            @RequestParam(name = "versaoId", required = false) String versaoId) {

        Long statusFiltro = parseLongFilter(statusId, "statusId");
        Long desenvolvedorFiltro = parseLongFilter(desenvolvedorId, "desenvolvedorId");
        Long tipoFiltro = parseLongFilter(tipoId, "tipoId");
        Long versaoFiltro = parseLongFilter(versaoId, "versaoId");

        String descricaoFiltro = StringUtils.hasText(descricao) ? descricao : null;

        if (descricaoFiltro != null || statusFiltro != null || desenvolvedorFiltro != null || tipoFiltro != null || versaoFiltro != null) {
            return service.filtrar(descricaoFiltro, statusFiltro, desenvolvedorFiltro, tipoFiltro, versaoFiltro);
        }
        return service.listar();
    }

    private Long parseLongFilter(String value, String paramName) {
        if (!StringUtils.hasText(value)) {
            return null;
        }

        try {
            return Long.valueOf(value);
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException("Parametro '" + paramName + "' deve ser numerico.");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<TarefaDTO> buscarPorId(@PathVariable("id") Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<TarefaDTO> salvar(@Valid @RequestBody TarefaRequestDTO dto) {
        return ResponseEntity.status(201).body(service.salvar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TarefaDTO> atualizar(@PathVariable("id") Long id, @Valid @RequestBody TarefaRequestDTO dto) {
        return ResponseEntity.ok(service.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable("id") Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
