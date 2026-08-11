package com.medcore.features.lab.repository;

import com.medcore.features.lab.entity.LabTest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LabTestRepository
        extends JpaRepository<LabTest, Long> {

    Optional<LabTest> findByIdAndDeletedAtIsNull(
            Long id
    );

    Optional<LabTest> findByNameIgnoreCaseAndDeletedAtIsNull(
            String name
    );

    boolean existsByNameIgnoreCaseAndDeletedAtIsNull(
            String name
    );
}