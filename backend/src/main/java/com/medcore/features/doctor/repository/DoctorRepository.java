package com.medcore.features.doctor.repository;

import com.medcore.features.doctor.entity.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface DoctorRepository
        extends JpaRepository<Doctor, Long>,
        JpaSpecificationExecutor<Doctor> {

    @EntityGraph(attributePaths = {"user", "hospital", "department"})
    Optional<Doctor> findByIdAndDeletedAtIsNull(Long doctorId);

    @EntityGraph(attributePaths = {"user", "hospital", "department"})
    Optional<Doctor> findByIdAndHospitalIdAndDeletedAtIsNull(
            Long doctorId,
            Long hospitalId
    );

    @EntityGraph(attributePaths = {"user", "hospital", "department"})
    Optional<Doctor> findByUserIdAndDeletedAtIsNull(Long userId);

    boolean existsByUserId(Long userId);

    @EntityGraph(attributePaths = {"user", "hospital", "department"})
    Page<Doctor> findByDeletedAtIsNull(Pageable pageable);

    @EntityGraph(attributePaths = {"user", "hospital", "department"})
    Page<Doctor> findByHospitalIdAndDeletedAtIsNull(
            Long hospitalId,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"user", "hospital", "department"})
    Page<Doctor> findBySpecializationContainingIgnoreCaseAndDeletedAtIsNull(
            String keyword,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"user", "hospital", "department"})
    Page<Doctor> findByHospitalIdAndSpecializationContainingIgnoreCaseAndDeletedAtIsNull(
            Long hospitalId,
            String keyword,
            Pageable pageable
    );

    Optional<Doctor> findByIdAndHospitalId(
            Long doctorId,
            Long hospitalId
    );
}