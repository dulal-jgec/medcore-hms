package com.medcore.features.billing.repository;

import com.medcore.features.billing.entity.BillItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BillItemRepository
        extends JpaRepository<BillItem, Long> {

    List<BillItem> findByBillIdAndDeletedAtIsNull(
            Long billId
    );

    Optional<BillItem>
    findByIdAndBillIdAndDeletedAtIsNull(
            Long itemId,
            Long billId
    );
}