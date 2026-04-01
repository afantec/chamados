package com.sustentacao.repository;

import com.sustentacao.entity.Tarefa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TarefaRepository extends JpaRepository<Tarefa, Long> {
    Optional<Tarefa> findByCodigo(String codigo);

    List<Tarefa> findByStatusId(Long statusId);

    List<Tarefa> findByDesenvolvedorId(Long desenvolvedorId);

    List<Tarefa> findByVersaoId(Long versaoId);

    @Query("SELECT t FROM Tarefa t WHERE " +
            "(:descricao IS NULL OR LOWER(t.descricao) LIKE LOWER(CONCAT('%', :descricao, '%'))) AND " +
            "(:statusId IS NULL OR t.status.id = :statusId) AND " +
            "(:desenvolvedorId IS NULL OR t.desenvolvedor.id = :desenvolvedorId) AND " +
            "(:tipoId IS NULL OR t.tipo.id = :tipoId) AND " +
            "(:versaoId IS NULL OR t.versao.id = :versaoId)")
    List<Tarefa> filtrar(
            @Param("descricao") String descricao,
            @Param("statusId") Long statusId,
            @Param("desenvolvedorId") Long desenvolvedorId,
            @Param("tipoId") Long tipoId,
            @Param("versaoId") Long versaoId
    );
}
