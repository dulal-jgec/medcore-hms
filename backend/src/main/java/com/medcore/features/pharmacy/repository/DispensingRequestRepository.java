package com.medcore.features.pharmacy.repository;

import com.medcore.features.pharmacy.entity.DispensingRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import com.medcore.features.pharmacy.enums.DispensingStatus;
import java.util.List;
import java.util.Optional;

public interface DispensingRequestRepository
        extends JpaRepository<DispensingRequest, Long> {

    boolean existsByPrescriptionIdAndDeletedAtIsNull(
            Long prescriptionId
    );

    Optional<DispensingRequest>
    findByIdAndDeletedAtIsNull(Long id);
    List<DispensingRequest>
    findByHospitalIdAndStatusAndDeletedAtIsNull(
            Long hospitalId,
            DispensingStatus status
    );
}