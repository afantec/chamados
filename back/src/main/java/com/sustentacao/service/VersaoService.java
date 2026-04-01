package com.sustentacao.service;

import com.sustentacao.dto.VersaoDTO;
import com.sustentacao.entity.Versao;
import com.sustentacao.repository.VersaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VersaoService {

    private final VersaoRepository repository;

    public List<VersaoDTO> listar() {
        return repository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public VersaoDTO buscarPorId(Long id) {
        return repository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Versão não encontrada: " + id));
    }

    public VersaoDTO salvar(VersaoDTO dto) {
        Versao versao = new Versao();
        versao.setNumeroVersao(dto.getNumeroVersao());
        versao.setDataCadastro(dto.getDataCadastro() != null ? dto.getDataCadastro() : LocalDate.now());
        versao.setDescricao(dto.getDescricao());
        return toDTO(repository.save(versao));
    }

    public VersaoDTO atualizar(Long id, VersaoDTO dto) {
        Versao versao = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Versão não encontrada: " + id));
        versao.setNumeroVersao(dto.getNumeroVersao());
        if (dto.getDataCadastro() != null) {
            versao.setDataCadastro(dto.getDataCadastro());
        }
        versao.setDescricao(dto.getDescricao());
        return toDTO(repository.save(versao));
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }

    public VersaoDTO toDTO(Versao versao) {
        VersaoDTO dto = new VersaoDTO();
        dto.setId(versao.getId());
        dto.setNumeroVersao(versao.getNumeroVersao());
        dto.setDataCadastro(versao.getDataCadastro());
        dto.setDescricao(versao.getDescricao());
        return dto;
    }
}
