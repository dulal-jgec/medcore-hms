package com.medcore.features.doctor.repository;

import com.medcore.features.doctor.entity.Doctor;
import com.medcore.features.doctor.enums.DoctorStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PublicDoctorRepository
        extends JpaRepository<Doctor, Long> {

    @EntityGraph(
            attributePaths = {
                    "user",
                    "hospital",
                    "department"
            }
    )
    Page<Doctor> findByHospitalIdAndStatusAndDeletedAtIsNull(
            Long hospitalId,
            DoctorStatus status,
            Pageable pageable
    );

    @EntityGraph(
            attributePaths = {
                    "user",
                    "hospital",
                    "department"
            }
    )
    Optional<Doctor>
    findByIdAndHospitalIdAndStatusAndDeletedAtIsNull(
            Long doctorId,
            Long hospitalId,
            DoctorStatus status
    );
}