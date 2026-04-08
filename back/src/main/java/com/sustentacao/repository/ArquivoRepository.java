package com.sustentacao.repository;

import com.sustentacao.entity.Arquivo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ArquivoRepository extends JpaRepository<Arquivo, Long> {
    List<Arquivo> findByTarefaIdOrderByDataUploadDesc(Long tarefaId);

    Optional<Arquivo> findByIdAndTarefaId(Long id, Long tarefaId);
}
