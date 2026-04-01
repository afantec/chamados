package com.sustentacao.repository;

import com.sustentacao.entity.Versao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VersaoRepository extends JpaRepository<Versao, Long> {
}
