package com.medcore.features.prescription.repository;

import com.medcore.features.prescription.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MedicineRepository
        extends JpaRepository<Medicine, Long> {

    Optional<Medicine> findByIdAndDeletedAtIsNull(Long id);

    boolean existsByNameIgnoreCaseAndStrengthIgnoreCaseAndDosageFormIgnoreCase(
            String name,
            String strength,
            String dosageForm
    );
}