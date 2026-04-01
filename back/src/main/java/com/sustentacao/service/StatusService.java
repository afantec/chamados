package com.sustentacao.service;

import com.sustentacao.dto.StatusDTO;
import com.sustentacao.entity.Status;
import com.sustentacao.repository.StatusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatusService {

    private final StatusRepository repository;

    public List<StatusDTO> listar() {
        return repository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public StatusDTO buscarPorId(Long id) {
        return repository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Status não encontrado: " + id));
    }

    public StatusDTO salvar(StatusDTO dto) {
        Status status = new Status();
        status.setDescricao(dto.getDescricao());
        return toDTO(repository.save(status));
    }

    public StatusDTO atualizar(Long id, StatusDTO dto) {
        Status status = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Status não encontrado: " + id));
        status.setDescricao(dto.getDescricao());
        return toDTO(repository.save(status));
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }

    public StatusDTO toDTO(Status status) {
        StatusDTO dto = new StatusDTO();
        dto.setId(status.getId());
        dto.setDescricao(status.getDescricao());
        return dto;
    }
}
