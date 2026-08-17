package com.medcore.features.receptionist.repository;

import com.medcore.features.receptionist.entity.Receptionist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReceptionistRepository
        extends JpaRepository<Receptionist, Long> {

    Optional<Receptionist> findByIdAndDeletedAtIsNull(
            Long id
    );

    Optional<Receptionist> findByUserIdAndDeletedAtIsNull(
            Long userId
    );

    boolean existsByUserIdAndDeletedAtIsNull(
            Long userId
    );

    List<Receptionist> findByHospitalIdAndDeletedAtIsNull(
            Long hospitalId
    );
}