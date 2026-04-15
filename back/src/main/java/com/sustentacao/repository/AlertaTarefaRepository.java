package com.sustentacao.repository;

import com.sustentacao.entity.AlertaTarefa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertaTarefaRepository extends JpaRepository<AlertaTarefa, Long> {
    List<AlertaTarefa> findByActiveTrueOrderByCreatedAtDesc();
    List<AlertaTarefa> findByTarefaIdOrderByCreatedAtDesc(Long tarefaId);
}
