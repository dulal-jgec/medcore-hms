package com.medcore.features.nurse.repository;

import com.medcore.features.nurse.entity.Nurse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
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


    Optional<Nurse> findByIdAndHospitalIdAndDeletedAtIsNull(
            Long nurseId,
            Long hospitalId
    );

    Optional<Nurse> findByUserIdAndHospitalIdAndDeletedAtIsNull(
            Long userId,
            Long hospitalId
    );

    boolean existsByUserIdAndHospitalIdAndDeletedAtIsNull(
            Long userId,
            Long hospitalId
    );

    List<Nurse> findByHospitalIdAndDeletedAtIsNull(
            Long hospitalId
    );
    
    
}