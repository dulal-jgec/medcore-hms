package com.medcore.features.pharmacy.repository;

import com.medcore.features.pharmacy.entity.PharmacyInventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PharmacyInventoryRepository
        extends JpaRepository<PharmacyInventory, Long> {

    Optional<PharmacyInventory>
    findByIdAndDeletedAtIsNull(Long id);

    List<PharmacyInventory>
    findByPharmacyIdAndDeletedAtIsNull(Long pharmacyId);

    Optional<PharmacyInventory>
    findByPharmacyIdAndMedicineIdAndBatchNumberAndDeletedAtIsNull(
            Long pharmacyId,
            Long medicineId,
            String batchNumber
    );
    
    List<PharmacyInventory> findByPharmacyIdAndMedicineIdAndActiveTrueAndDeletedAtIsNullOrderByExpiryDateAsc(
            Long pharmacyId,
            Long medicineId
    );
}