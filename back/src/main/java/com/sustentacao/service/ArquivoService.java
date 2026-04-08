package com.sustentacao.service;

import com.sustentacao.dto.ArquivoDTO;
import com.sustentacao.entity.Arquivo;
import com.sustentacao.repository.ArquivoRepository;
import com.sustentacao.repository.TarefaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArquivoService {

    private static final Set<String> EXTENSOES_PERMITIDAS = Set.of(
            "png", "jpg", "jpeg", "gif", "webp", "bmp",
            "pdf",
            "doc", "docx",
            "xls", "xlsx"
    );

    private final ArquivoRepository arquivoRepository;
    private final TarefaRepository tarefaRepository;

    @Value("${app.upload.base-dir:C:/Sustentacao}")
    private String uploadBaseDir;

    public List<ArquivoDTO> listarPorTarefa(Long tarefaId) {
        validarTarefaExiste(tarefaId);
        return arquivoRepository.findByTarefaIdOrderByDataUploadDesc(tarefaId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ArquivoDTO salvar(Long tarefaId, MultipartFile multipartFile) {
        validarTarefaExiste(tarefaId);

        if (multipartFile == null || multipartFile.isEmpty()) {
            throw new IllegalArgumentException("Selecione um arquivo para upload.");
        }

        String nomeOriginal = StringUtils.cleanPath(multipartFile.getOriginalFilename() == null ? "" : multipartFile.getOriginalFilename());
        if (!StringUtils.hasText(nomeOriginal)) {
            throw new IllegalArgumentException("Nome do arquivo inválido.");
        }

        String extensao = extrairExtensao(nomeOriginal);
        if (!EXTENSOES_PERMITIDAS.contains(extensao)) {
            throw new IllegalArgumentException("Tipo de arquivo não permitido. Permitidos: imagem, PDF, Word e Excel.");
        }

        String nomeArmazenado = UUID.randomUUID() + "." + extensao;
        Path diretorioTarefa = Paths.get(uploadBaseDir, String.valueOf(tarefaId));

        try {
            Files.createDirectories(diretorioTarefa);
            Path destino = diretorioTarefa.resolve(nomeArmazenado);
            Files.copy(multipartFile.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

            Arquivo arquivo = new Arquivo();
            arquivo.setTarefaId(tarefaId);
            arquivo.setNomeOriginal(nomeOriginal);
            arquivo.setNomeArmazenado(nomeArmazenado);
            arquivo.setCaminhoCompleto(destino.toAbsolutePath().toString());
            arquivo.setTamanhoBytes(multipartFile.getSize());
            arquivo.setContentType(multipartFile.getContentType());
            arquivo.setExtensao(extensao);

            return toDTO(arquivoRepository.save(arquivo));
        } catch (IOException ex) {
            throw new IllegalArgumentException("Não foi possível salvar o arquivo no diretório de sustentação.");
        }
    }

    public Resource carregarArquivoParaDownload(Long tarefaId, Long arquivoId) {
        validarTarefaExiste(tarefaId);

        Arquivo arquivo = obterArquivoDaTarefa(tarefaId, arquivoId);

        try {
            Path path = Paths.get(arquivo.getCaminhoCompleto());
            Resource resource = new UrlResource(path.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new RuntimeException("Arquivo não encontrado no armazenamento físico.");
            }
            return resource;
        } catch (MalformedURLException ex) {
            throw new RuntimeException("Erro ao preparar download do arquivo.");
        }
    }

    public String obterNomeOriginal(Long tarefaId, Long arquivoId) {
        return obterArquivoDaTarefa(tarefaId, arquivoId).getNomeOriginal();
    }

    public String obterContentType(Long tarefaId, Long arquivoId) {
        String contentType = obterArquivoDaTarefa(tarefaId, arquivoId).getContentType();
        return StringUtils.hasText(contentType) ? contentType : "application/octet-stream";
    }

    private void validarTarefaExiste(Long tarefaId) {
        if (!tarefaRepository.existsById(tarefaId)) {
            throw new RuntimeException("Tarefa não encontrada: " + tarefaId);
        }
    }

    private String extrairExtensao(String nomeOriginal) {
        int idx = nomeOriginal.lastIndexOf('.');
        if (idx < 0 || idx == nomeOriginal.length() - 1) {
            return "";
        }
        return nomeOriginal.substring(idx + 1).toLowerCase(Locale.ROOT);
    }

    private Arquivo obterArquivoDaTarefa(Long tarefaId, Long arquivoId) {
        return arquivoRepository.findByIdAndTarefaId(arquivoId, tarefaId)
                .orElseThrow(() -> new RuntimeException("Arquivo não encontrado."));
    }

    private ArquivoDTO toDTO(Arquivo arquivo) {
        ArquivoDTO dto = new ArquivoDTO();
        dto.setId(arquivo.getId());
        dto.setTarefaId(arquivo.getTarefaId());
        dto.setNomeOriginal(arquivo.getNomeOriginal());
        dto.setTamanhoBytes(arquivo.getTamanhoBytes());
        dto.setContentType(arquivo.getContentType());
        dto.setExtensao(arquivo.getExtensao());
        dto.setDataUpload(arquivo.getDataUpload());
        return dto;
    }
}
