package com.medcore.features.patient.repository;

import com.medcore.features.patient.entity.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
public interface PatientRepository
        extends JpaRepository<Patient, Long> {

	boolean existsByUserIdAndHospitalId(
	        Long userId,
	        Long hospitalId
	);

    Optional<Patient> findByUserIdAndHospitalIdAndDeletedAtIsNull(
            Long userId,
            Long hospitalId
    );

    Optional<Patient> findByIdAndDeletedAtIsNull(
            Long patientId
    );

    Page<Patient> findByHospitalIdAndDeletedAtIsNull(
            Long hospitalId,
            Pageable pageable
    );

    Page<Patient>
    findByHospitalIdAndUserFullNameContainingIgnoreCaseAndDeletedAtIsNull(
            Long hospitalId,
            String keyword,
            Pageable pageable
    );

    Optional<Patient>
    findByIdAndHospitalIdAndDeletedAtIsNull(
            Long patientId,
            Long hospitalId
    );

    Optional<Patient>
    findByIdAndHospitalId(
            Long patientId,
            Long hospitalId
    );
    
    
    @Query("""
    	    SELECT p
    	    FROM Patient p
    	    JOIN FETCH p.user
    	    JOIN FETCH p.hospital
    	    WHERE p.user.id = :userId
    	      AND p.hospital.id = :hospitalId
    	      AND p.deletedAt IS NULL
    	""")
    	Optional<Patient> findMyProfile(
    	        @Param("userId") Long userId,
    	        @Param("hospitalId") Long hospitalId
    	);
}