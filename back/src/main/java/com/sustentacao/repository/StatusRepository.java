package com.sustentacao.repository;

import com.sustentacao.entity.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StatusRepository extends JpaRepository<Status, Long> {
    java.util.Optional<Status> findByDescricaoIgnoreCase(String descricao);
}
