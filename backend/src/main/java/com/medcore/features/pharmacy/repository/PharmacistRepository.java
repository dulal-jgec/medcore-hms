package com.medcore.features.pharmacy.repository;

import com.medcore.features.pharmacy.entity.Pharmacist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PharmacistRepository
        extends JpaRepository<Pharmacist, Long> {

	Optional<Pharmacist> findByUserIdAndHospitalIdAndDeletedAtIsNull(
	        Long userId,
	        Long hospitalId
	);
}