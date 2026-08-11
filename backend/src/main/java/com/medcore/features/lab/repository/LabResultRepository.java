package com.medcore.features.lab.repository;

import com.medcore.features.lab.entity.LabResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LabResultRepository
        extends JpaRepository<LabResult, Long> {

    Optional<LabResult> findByIdAndDeletedAtIsNull(
            Long id
    );

    Optional<LabResult> findByLabOrderItemIdAndDeletedAtIsNull(
            Long labOrderItemId
    );

    boolean existsByLabOrderItemIdAndDeletedAtIsNull(
            Long labOrderItemId
    );
}