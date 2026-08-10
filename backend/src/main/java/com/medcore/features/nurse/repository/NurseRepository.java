package com.medcore.features.nurse.repository;

import com.medcore.features.nurse.entity.Nurse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NurseRepository
        extends JpaRepository<Nurse, Long> {

    Optional<Nurse> findByIdAndDeletedAtIsNull(
            Long id
    );

    Optional<Nurse> findByUserIdAndDeletedAtIsNull(
            Long userId
    );

    boolean existsByUserIdAndDeletedAtIsNull(
            Long userId
    );
}