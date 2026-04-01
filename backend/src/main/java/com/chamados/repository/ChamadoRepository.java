package com.chamados.repository;

import com.chamados.model.Chamado;
import com.chamados.model.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChamadoRepository extends JpaRepository<Chamado, Long> {

    List<Chamado> findByStatusOrderByDataAberturaDesc(Status status);

    List<Chamado> findAllByOrderByDataAberturaDesc();
}
