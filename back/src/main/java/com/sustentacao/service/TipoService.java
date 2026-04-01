package com.sustentacao.service;

import com.sustentacao.dto.TipoDTO;
import com.sustentacao.entity.Tipo;
import com.sustentacao.repository.TipoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TipoService {

    private final TipoRepository repository;

    public List<TipoDTO> listar() {
        return repository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public TipoDTO buscarPorId(Long id) {
        return repository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Tipo não encontrado: " + id));
    }

    public TipoDTO salvar(TipoDTO dto) {
        Tipo tipo = new Tipo();
        tipo.setDescricao(dto.getDescricao());
        return toDTO(repository.save(tipo));
    }

    public TipoDTO atualizar(Long id, TipoDTO dto) {
        Tipo tipo = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tipo não encontrado: " + id));
        tipo.setDescricao(dto.getDescricao());
        return toDTO(repository.save(tipo));
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }

    private TipoDTO toDTO(Tipo tipo) {
        TipoDTO dto = new TipoDTO();
        dto.setId(tipo.getId());
        dto.setDescricao(tipo.getDescricao());
        return dto;
    }
}
