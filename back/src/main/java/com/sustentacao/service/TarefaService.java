package com.sustentacao.service;

import com.sustentacao.dto.*;
import com.sustentacao.entity.*;
import com.sustentacao.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TarefaService {

    private final TarefaRepository tarefaRepository;
    private final TipoRepository tipoRepository;
    private final DesenvolvedorRepository desenvolvedorRepository;
    private final StatusRepository statusRepository;
    private final VersaoRepository versaoRepository;

    private static final String STATUS_FINALIZADO = "Finalizado";

    public List<TarefaDTO> listar() {
        return tarefaRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<TarefaDTO> filtrar(String descricao, Long statusId, Long desenvolvedorId, Long tipoId, Long versaoId) {
        return tarefaRepository.filtrar(descricao, statusId, desenvolvedorId, tipoId, versaoId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public TarefaDTO buscarPorId(Long id) {
        return tarefaRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Tarefa não encontrada: " + id));
    }

    @Transactional
    public TarefaDTO salvar(TarefaRequestDTO request) {
        validarRequest(request);

        Tarefa tarefa = new Tarefa();
        preencherTarefa(tarefa, request);
        return toDTO(tarefaRepository.save(tarefa));
    }

    @Transactional
    public TarefaDTO atualizar(Long id, TarefaRequestDTO request) {
        Tarefa tarefa = tarefaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarefa não encontrada: " + id));

        validarRequest(request);
        preencherTarefa(tarefa, request);
        return toDTO(tarefaRepository.save(tarefa));
    }

    @Transactional
    public void deletar(Long id) {
        tarefaRepository.deleteById(id);
    }

    private void preencherTarefa(Tarefa tarefa, TarefaRequestDTO request) {
        tarefa.setCodigo(request.getCodigo());
        tarefa.setDescricao(request.getDescricao());
        tarefa.setPrioridade(request.getPrioridade());
        tarefa.setPercentualCompleto(request.getPercentualCompleto() != null ? request.getPercentualCompleto() : 0);
        tarefa.setBranchNome(request.getBranchNome());
        tarefa.setDataEntrega(request.getDataEntrega());
        tarefa.setDataFinalizacao(request.getDataFinalizacao());
        tarefa.setAmbiente(request.getAmbiente());

        Tipo tipo = tipoRepository.findById(request.getTipoId())
                .orElseThrow(() -> new RuntimeException("Tipo não encontrado: " + request.getTipoId()));
        tarefa.setTipo(tipo);

        Status status = statusRepository.findById(request.getStatusId())
                .orElseThrow(() -> new RuntimeException("Status não encontrado: " + request.getStatusId()));
        tarefa.setStatus(status);

        if (request.getDesenvolvedorId() != null) {
            Desenvolvedor dev = desenvolvedorRepository.findById(request.getDesenvolvedorId())
                    .orElseThrow(() -> new RuntimeException("Desenvolvedor não encontrado: " + request.getDesenvolvedorId()));
            tarefa.setDesenvolvedor(dev);
        } else {
            tarefa.setDesenvolvedor(null);
        }

        if (request.getVersaoId() != null) {
            Versao versao = versaoRepository.findById(request.getVersaoId())
                    .orElseThrow(() -> new RuntimeException("Versão não encontrada: " + request.getVersaoId()));
            tarefa.setVersao(versao);
        } else {
            tarefa.setVersao(null);
        }
    }

    private void validarRequest(TarefaRequestDTO request) {
        Status status = statusRepository.findById(request.getStatusId())
                .orElseThrow(() -> new RuntimeException("Status não encontrado: " + request.getStatusId()));

        if (STATUS_FINALIZADO.equalsIgnoreCase(status.getDescricao())
                && !StringUtils.hasText(request.getAmbiente())) {
            throw new IllegalArgumentException("Campo 'ambiente' é obrigatório quando o status é 'Finalizado'.");
        }
    }

    private TarefaDTO toDTO(Tarefa t) {
        TarefaDTO dto = new TarefaDTO();
        dto.setId(t.getId());
        dto.setCodigo(t.getCodigo());
        dto.setDescricao(t.getDescricao());
        dto.setPrioridade(t.getPrioridade());
        dto.setPercentualCompleto(t.getPercentualCompleto());
        dto.setBranchNome(t.getBranchNome());
        dto.setDataCriacao(t.getDataCriacao());
        dto.setDataEntrega(t.getDataEntrega());
        dto.setDataFinalizacao(t.getDataFinalizacao());
        dto.setAmbiente(t.getAmbiente());

        if (t.getTipo() != null) {
            TipoDTO tipoDTO = new TipoDTO();
            tipoDTO.setId(t.getTipo().getId());
            tipoDTO.setDescricao(t.getTipo().getDescricao());
            dto.setTipo(tipoDTO);
        }

        if (t.getStatus() != null) {
            StatusDTO statusDTO = new StatusDTO();
            statusDTO.setId(t.getStatus().getId());
            statusDTO.setDescricao(t.getStatus().getDescricao());
            dto.setStatus(statusDTO);
        }

        if (t.getDesenvolvedor() != null) {
            DesenvolvedorDTO devDTO = new DesenvolvedorDTO();
            devDTO.setId(t.getDesenvolvedor().getId());
            devDTO.setNome(t.getDesenvolvedor().getNome());
            devDTO.setEmail(t.getDesenvolvedor().getEmail());
            devDTO.setAtivo(t.getDesenvolvedor().getAtivo());
            dto.setDesenvolvedor(devDTO);
        }

        if (t.getVersao() != null) {
            VersaoDTO versaoDTO = new VersaoDTO();
            versaoDTO.setId(t.getVersao().getId());
            versaoDTO.setNumeroVersao(t.getVersao().getNumeroVersao());
            versaoDTO.setDataCadastro(t.getVersao().getDataCadastro());
            versaoDTO.setDescricao(t.getVersao().getDescricao());
            dto.setVersao(versaoDTO);
        }

        if (t.getAnotacoes() != null) {
            dto.setAnotacoes(t.getAnotacoes().stream().map(a -> {
                AnotacaoDTO aDTO = new AnotacaoDTO();
                aDTO.setId(a.getId());
                aDTO.setDescricao(a.getDescricao());
                aDTO.setDataAnotacao(a.getDataAnotacao());
                aDTO.setTarefaId(t.getId());
                return aDTO;
            }).collect(Collectors.toList()));
        }

        return dto;
    }
}
