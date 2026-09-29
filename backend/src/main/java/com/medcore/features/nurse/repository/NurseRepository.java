package com.medcore.features.nurse.repository;

import com.medcore.features.nurse.entity.Nurse;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NurseRepository
        extends JpaRepository<Nurse, Long> {

    @EntityGraph(attributePaths = {"user", "hospital"})
    Optional<Nurse> findByIdAndDeletedAtIsNull(
            Long id
    );

    @EntityGraph(attributePaths = {"user", "hospital"})
    Optional<Nurse> findByUserIdAndDeletedAtIsNull(
            Long userId
    );

    boolean existsByUserIdAndDeletedAtIsNull(
            Long userId
    );

    @EntityGraph(attributePaths = {"user", "hospital"})
    Optional<Nurse> findByIdAndHospitalIdAndDeletedAtIsNull(
            Long nurseId,
            Long hospitalId
    );

    @EntityGraph(attributePaths = {"user", "hospital"})
    Optional<Nurse> findByUserIdAndHospitalIdAndDeletedAtIsNull(
            Long userId,
            Long hospitalId
    );

    boolean existsByUserIdAndHospitalIdAndDeletedAtIsNull(
            Long userId,
            Long hospitalId
    );

    @EntityGraph(attributePaths = {"user", "hospital"})
    List<Nurse> findByHospitalIdAndDeletedAtIsNull(
            Long hospitalId
    );
}