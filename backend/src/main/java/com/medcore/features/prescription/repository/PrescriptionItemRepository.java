package com.medcore.features.prescription.repository;

import com.medcore.features.prescription.entity.PrescriptionItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PrescriptionItemRepository
        extends JpaRepository<PrescriptionItem, Long> {

    List<PrescriptionItem> findByPrescriptionIdAndDeletedAtIsNull(
            Long prescriptionId
    );
    
    boolean existsByPrescriptionIdAndDeletedAtIsNull(
            Long prescriptionId
    );
    
    Optional<PrescriptionItem>
    findByIdAndPrescriptionIdAndDeletedAtIsNull(
            Long itemId,
            Long prescriptionId
    );
}