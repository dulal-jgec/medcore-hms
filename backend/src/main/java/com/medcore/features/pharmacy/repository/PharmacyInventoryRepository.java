package com.medcore.features.pharmacy.repository;

import com.medcore.features.pharmacy.entity.PharmacyInventory;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PharmacyInventoryRepository
        extends JpaRepository<PharmacyInventory, Long> {

    Optional<PharmacyInventory>
    findByIdAndDeletedAtIsNull(Long id);

    Page<PharmacyInventory> findByPharmacyIdAndDeletedAtIsNull(
            Long pharmacyId,
            Pageable pageable
    );

    Optional<PharmacyInventory>
    findByPharmacyIdAndMedicineIdAndBatchNumberAndDeletedAtIsNull(
            Long pharmacyId,
            Long medicineId,
            String batchNumber
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT i
            FROM PharmacyInventory i
            WHERE i.pharmacy.id = :pharmacyId
              AND i.medicine.id = :medicineId
              AND i.active = true
              AND i.deletedAt IS NULL
              AND i.expiryDate >= :today
            ORDER BY i.expiryDate ASC
            """)
    List<PharmacyInventory> findAvailableInventory(
            @Param("pharmacyId") Long pharmacyId,
            @Param("medicineId") Long medicineId,
            @Param("today") LocalDate today
    );
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT i
            FROM PharmacyInventory i
            WHERE i.id = :inventoryId
              AND i.deletedAt IS NULL
            """)
    Optional<PharmacyInventory> findByIdForUpdate(
            @Param("inventoryId") Long inventoryId
    );
}