package com.medcore.features.receptionist.repository;

import com.medcore.features.receptionist.entity.Receptionist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReceptionistRepository
        extends JpaRepository<Receptionist, Long> {

    @EntityGraph(attributePaths = {"user", "hospital"})
    Optional<Receptionist> findByIdAndDeletedAtIsNull(
            Long id
    );

    @EntityGraph(attributePaths = {"user", "hospital"})
    Optional<Receptionist> findByUserIdAndDeletedAtIsNull(
            Long userId
    );

    boolean existsByUserIdAndDeletedAtIsNull(
            Long userId
    );

    @EntityGraph(attributePaths = {"user", "hospital"})
    Page<Receptionist> findByHospitalIdAndDeletedAtIsNull(
            Long hospitalId,
            Pageable pageable
    );
}