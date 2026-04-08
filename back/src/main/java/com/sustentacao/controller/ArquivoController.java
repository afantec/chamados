package com.sustentacao.controller;

import com.sustentacao.dto.ArquivoDTO;
import com.sustentacao.service.ArquivoService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/tarefas")
@RequiredArgsConstructor
public class ArquivoController {

    private final ArquivoService arquivoService;

    @GetMapping("/{tarefaId}/arquivos")
    public List<ArquivoDTO> listarPorTarefa(@PathVariable("tarefaId") Long tarefaId) {
        return arquivoService.listarPorTarefa(tarefaId);
    }

    @PostMapping(value = "/{tarefaId}/arquivos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ArquivoDTO> upload(
            @PathVariable("tarefaId") Long tarefaId,
            @RequestPart("arquivo") MultipartFile arquivo) {
        return ResponseEntity.status(201).body(arquivoService.salvar(tarefaId, arquivo));
    }

    @GetMapping("/{tarefaId}/arquivos/{arquivoId}/download")
    public ResponseEntity<Resource> download(
            @PathVariable("tarefaId") Long tarefaId,
            @PathVariable("arquivoId") Long arquivoId) {

        Resource resource = arquivoService.carregarArquivoParaDownload(tarefaId, arquivoId);
        String nomeOriginal = arquivoService.obterNomeOriginal(tarefaId, arquivoId);
        String contentType = arquivoService.obterContentType(tarefaId, arquivoId);

        String nomeUtf8 = java.net.URLEncoder.encode(nomeOriginal, StandardCharsets.UTF_8).replace("+", "%20");

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename*=UTF-8''" + nomeUtf8)
                .body(resource);
    }

    @DeleteMapping("/{tarefaId}/arquivos/{arquivoId}")
    public ResponseEntity<Void> deletar(
            @PathVariable("tarefaId") Long tarefaId,
            @PathVariable("arquivoId") Long arquivoId) {
        arquivoService.deletar(tarefaId, arquivoId);
        return ResponseEntity.noContent().build();
    }
}
