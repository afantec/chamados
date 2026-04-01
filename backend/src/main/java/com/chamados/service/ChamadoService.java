package com.chamados.service;

import com.chamados.dto.ChamadoDTO;
import com.chamados.model.Chamado;
import com.chamados.model.Status;
import com.chamados.repository.ChamadoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ChamadoService {

    private final ChamadoRepository chamadoRepository;

    @Transactional(readOnly = true)
    public List<ChamadoDTO> findAll() {
        return chamadoRepository.findAllByOrderByDataAberturaDesc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ChamadoDTO findById(Long id) {
        Chamado chamado = chamadoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Chamado não encontrado com id: " + id));
        return toDTO(chamado);
    }

    @Transactional(readOnly = true)
    public List<ChamadoDTO> findByStatus(Status status) {
        return chamadoRepository.findByStatusOrderByDataAberturaDesc(status)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ChamadoDTO create(ChamadoDTO dto) {
        Chamado chamado = toEntity(dto);
        chamado.setId(null);
        chamado.setDataAbertura(null);
        if (chamado.getStatus() == null) {
            chamado.setStatus(Status.ABERTO);
        }
        Chamado saved = chamadoRepository.save(chamado);
        return toDTO(saved);
    }

    public ChamadoDTO update(Long id, ChamadoDTO dto) {
        Chamado existing = chamadoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Chamado não encontrado com id: " + id));

        existing.setTitulo(dto.getTitulo());
        existing.setDescricao(dto.getDescricao());
        existing.setCategoria(dto.getCategoria());
        existing.setSolicitante(dto.getSolicitante());
        existing.setResponsavel(dto.getResponsavel());
        existing.setPrioridade(dto.getPrioridade() != null ? dto.getPrioridade() : existing.getPrioridade());

        Status newStatus = dto.getStatus() != null ? dto.getStatus() : existing.getStatus();
        if (newStatus == Status.FECHADO && existing.getStatus() != Status.FECHADO) {
            existing.setDataFechamento(LocalDateTime.now());
        } else if (newStatus != Status.FECHADO) {
            existing.setDataFechamento(null);
        }
        existing.setStatus(newStatus);

        Chamado saved = chamadoRepository.save(existing);
        return toDTO(saved);
    }

    public void delete(Long id) {
        if (!chamadoRepository.existsById(id)) {
            throw new EntityNotFoundException("Chamado não encontrado com id: " + id);
        }
        chamadoRepository.deleteById(id);
    }

    private ChamadoDTO toDTO(Chamado chamado) {
        return ChamadoDTO.builder()
                .id(chamado.getId())
                .titulo(chamado.getTitulo())
                .descricao(chamado.getDescricao())
                .status(chamado.getStatus())
                .prioridade(chamado.getPrioridade())
                .categoria(chamado.getCategoria())
                .solicitante(chamado.getSolicitante())
                .responsavel(chamado.getResponsavel())
                .dataAbertura(chamado.getDataAbertura())
                .dataFechamento(chamado.getDataFechamento())
                .build();
    }

    private Chamado toEntity(ChamadoDTO dto) {
        return Chamado.builder()
                .id(dto.getId())
                .titulo(dto.getTitulo())
                .descricao(dto.getDescricao())
                .status(dto.getStatus())
                .prioridade(dto.getPrioridade())
                .categoria(dto.getCategoria())
                .solicitante(dto.getSolicitante())
                .responsavel(dto.getResponsavel())
                .dataAbertura(dto.getDataAbertura())
                .dataFechamento(dto.getDataFechamento())
                .build();
    }
}
