package com.sustentacao.service;

import com.sustentacao.dto.DesenvolvedorDTO;
import com.sustentacao.entity.Desenvolvedor;
import com.sustentacao.repository.DesenvolvedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DesenvolvedorService {

    private final DesenvolvedorRepository repository;

    public List<DesenvolvedorDTO> listar() {
        return repository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<DesenvolvedorDTO> listarAtivos() {
        return repository.findByAtivoTrue().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public DesenvolvedorDTO buscarPorId(Long id) {
        return repository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Desenvolvedor não encontrado: " + id));
    }

    public DesenvolvedorDTO salvar(DesenvolvedorDTO dto) {
        Desenvolvedor dev = new Desenvolvedor();
        dev.setNome(dto.getNome());
        dev.setEmail(dto.getEmail());
        dev.setAtivo(dto.getAtivo() != null ? dto.getAtivo() : true);
        return toDTO(repository.save(dev));
    }

    public DesenvolvedorDTO atualizar(Long id, DesenvolvedorDTO dto) {
        Desenvolvedor dev = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Desenvolvedor não encontrado: " + id));
        dev.setNome(dto.getNome());
        dev.setEmail(dto.getEmail());
        if (dto.getAtivo() != null) {
            dev.setAtivo(dto.getAtivo());
        }
        return toDTO(repository.save(dev));
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }

    public DesenvolvedorDTO toDTO(Desenvolvedor dev) {
        DesenvolvedorDTO dto = new DesenvolvedorDTO();
        dto.setId(dev.getId());
        dto.setNome(dev.getNome());
        dto.setEmail(dev.getEmail());
        dto.setAtivo(dev.getAtivo());
        return dto;
    }
}
