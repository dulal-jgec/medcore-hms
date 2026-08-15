package com.medcore.features.doctor.repository;

import com.medcore.features.doctor.entity.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface DoctorRepository
extends JpaRepository<Doctor, Long>,
        JpaSpecificationExecutor<Doctor> {

 
	Optional<Doctor> findByIdAndDeletedAtIsNull(Long doctorId);

	Optional<Doctor> findByIdAndHospitalIdAndDeletedAtIsNull(
    Long doctorId,
    Long hospitalId
);

 
	boolean existsByUserId(Long userId);

 
	Page<Doctor> findByDeletedAtIsNull(Pageable pageable);

	Page<Doctor> findByHospitalIdAndDeletedAtIsNull(
    Long hospitalId,
    Pageable pageable
);

 
	Page<Doctor> findBySpecializationContainingIgnoreCaseAndDeletedAtIsNull(
    String keyword,
    Pageable pageable
);

 
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
	
	