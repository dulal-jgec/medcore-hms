package com.medcore.features.patient.repository;

import com.medcore.features.patient.entity.Patient;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    boolean existsByUserId(Long userId);

    @EntityGraph(attributePaths = {"user"})
    Optional<Patient> findByIdAndUserHospitalIdAndDeletedAtIsNull(
            Long patientId,
            Long hospitalId
    );

    @EntityGraph(attributePaths = {"user"})
    Optional<Patient> findByIdAndUserHospitalId(
            Long patientId,
            Long hospitalId
    );

    @EntityGraph(attributePaths = {"user"})
    Optional<Patient> findByUserIdAndDeletedAtIsNull(
            Long userId
    );

    @EntityGraph(attributePaths = {"user"})
    Optional<Patient> findByIdAndDeletedAtIsNull(
            Long id
    );

    @EntityGraph(attributePaths = {"user"})
    Page<Patient> findByUserHospitalIdAndDeletedAtIsNull(
            Long hospitalId,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"user"})
    @Query("""
        SELECT DISTINCT p FROM Patient p
        JOIN p.user u
        WHERE p.deletedAt IS NULL
          AND (
            u.hospital.id = :hospitalId
            OR EXISTS (
                SELECT 1 FROM Appointment a
                WHERE a.patient = p
                  AND a.hospital.id = :hospitalId
                  AND a.deletedAt IS NULL
            )
          )
          AND (
            LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR u.phone LIKE CONCAT('%', :keyword, '%')
          )
    """)
    Page<Patient> searchPatientsForHospital(
            @Param("hospitalId") Long hospitalId,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"user"})
    @Query("""
        SELECT DISTINCT p FROM Patient p
        JOIN p.user u
        WHERE p.deletedAt IS NULL
          AND (
            u.hospital.id = :hospitalId
            OR EXISTS (
                SELECT 1 FROM Appointment a
                WHERE a.patient = p
                  AND a.hospital.id = :hospitalId
                  AND a.deletedAt IS NULL
            )
          )
    """)
    Page<Patient> findRecentForHospital(
            @Param("hospitalId") Long hospitalId,
            Pageable pageable
    );
    
    @EntityGraph(attributePaths = {"user"})
    @Query("""
        SELECT p FROM Patient p
        JOIN p.user u
        WHERE p.id = :patientId
          AND p.deletedAt IS NULL
          AND (
            u.hospital.id = :hospitalId
            OR EXISTS (
                SELECT 1 FROM Appointment a
                WHERE a.patient = p
                  AND a.hospital.id = :hospitalId
                  AND a.deletedAt IS NULL
            )
          )
    """)
    Optional<Patient> findAccessiblePatient(
            @Param("patientId") Long patientId,
            @Param("hospitalId") Long hospitalId
    );
}