package com.sustentacao.service;

import com.sustentacao.dto.AnotacaoDTO;
import com.sustentacao.dto.AnotacaoRequestDTO;
import com.sustentacao.entity.Anotacao;
import com.sustentacao.entity.Tarefa;
import com.sustentacao.repository.AnotacaoRepository;
import com.sustentacao.repository.TarefaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnotacaoService {

    private final AnotacaoRepository repository;
    private final TarefaRepository tarefaRepository;

    public List<AnotacaoDTO> listarPorTarefa(Long tarefaId) {
        return repository.findByTarefaIdOrderByDataAnotacaoDesc(tarefaId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public AnotacaoDTO buscarPorId(Long id) {
        return repository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Anotação não encontrada: " + id));
    }

    public AnotacaoDTO salvar(AnotacaoRequestDTO request) {
        Tarefa tarefa = tarefaRepository.findById(request.getTarefaId())
                .orElseThrow(() -> new RuntimeException("Tarefa não encontrada: " + request.getTarefaId()));

        Anotacao anotacao = new Anotacao();
        anotacao.setDescricao(request.getDescricao());
        anotacao.setTarefa(tarefa);
        return toDTO(repository.save(anotacao));
    }

    public AnotacaoDTO atualizar(Long id, AnotacaoRequestDTO request) {
        Anotacao anotacao = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Anotação não encontrada: " + id));
        anotacao.setDescricao(request.getDescricao());
        return toDTO(repository.save(anotacao));
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }

    private AnotacaoDTO toDTO(Anotacao a) {
        AnotacaoDTO dto = new AnotacaoDTO();
        dto.setId(a.getId());
        dto.setDescricao(a.getDescricao());
        dto.setDataAnotacao(a.getDataAnotacao());
        dto.setTarefaId(a.getTarefa().getId());
        return dto;
    }
}
