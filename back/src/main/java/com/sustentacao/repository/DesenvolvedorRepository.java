package com.sustentacao.repository;

import com.sustentacao.entity.Desenvolvedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DesenvolvedorRepository extends JpaRepository<Desenvolvedor, Long> {
    List<Desenvolvedor> findByAtivoTrue();
}
