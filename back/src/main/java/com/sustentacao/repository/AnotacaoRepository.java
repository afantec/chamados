package com.sustentacao.repository;

import com.sustentacao.entity.Anotacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnotacaoRepository extends JpaRepository<Anotacao, Long> {
    List<Anotacao> findByTarefaIdOrderByDataAnotacaoDesc(Long tarefaId);
}
