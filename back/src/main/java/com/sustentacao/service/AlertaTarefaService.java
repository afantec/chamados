package com.sustentacao.service;

import com.sustentacao.dto.AlertaTarefaDTO;
import com.sustentacao.dto.AlertaTarefaRequestDTO;
import com.sustentacao.entity.AlertaTarefa;
import com.sustentacao.entity.Tarefa;
import com.sustentacao.repository.AlertaTarefaRepository;
import com.sustentacao.repository.TarefaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlertaTarefaService {

    private final AlertaTarefaRepository repository;
    private final TarefaRepository tarefaRepository;

    public List<AlertaTarefaDTO> listarAtivos() {
        return repository.findByActiveTrueOrderByCreatedAtDesc()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<AlertaTarefaDTO> listarPorTarefa(Long tarefaId) {
        return repository.findByTarefaIdOrderByCreatedAtDesc(tarefaId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public AlertaTarefaDTO salvar(AlertaTarefaRequestDTO request) {
        Tarefa tarefa = tarefaRepository.findById(request.getTarefaId())
                .orElseThrow(() -> new RuntimeException("Tarefa não encontrada: " + request.getTarefaId()));

        AlertaTarefa alerta = new AlertaTarefa();
        alerta.setTarefa(tarefa);
        alerta.setMessage(request.getMessage().trim());
        alerta.setActive(true);

        return toDTO(repository.save(alerta));
    }

    @Transactional
    public AlertaTarefaDTO desativar(Long id) {
        AlertaTarefa alerta = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alerta não encontrado: " + id));

        alerta.setActive(false);
        return toDTO(repository.save(alerta));
    }

    private AlertaTarefaDTO toDTO(AlertaTarefa alerta) {
        AlertaTarefaDTO dto = new AlertaTarefaDTO();
        dto.setId(alerta.getId());
        dto.setMessage(alerta.getMessage());
        dto.setActive(alerta.getActive());
        dto.setCreatedAt(alerta.getCreatedAt());

        if (alerta.getTarefa() != null) {
            dto.setTarefaId(alerta.getTarefa().getId());
            dto.setTarefaCodigo(alerta.getTarefa().getCodigo());
            dto.setTarefaDescricao(alerta.getTarefa().getDescricao());
        }

        return dto;
    }
}
