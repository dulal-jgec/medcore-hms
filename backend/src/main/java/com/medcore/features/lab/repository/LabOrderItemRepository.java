package com.medcore.features.lab.repository;

import com.medcore.features.lab.entity.LabOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LabOrderItemRepository
        extends JpaRepository<LabOrderItem, Long> {

    Optional<LabOrderItem> findByIdAndDeletedAtIsNull(
            Long id
    );

    Optional<LabOrderItem>
    findByIdAndLabOrderIdAndDeletedAtIsNull(
            Long id,
            Long labOrderId
    );

    List<LabOrderItem>
    findByLabOrderIdAndDeletedAtIsNull(
            Long labOrderId
    );

    boolean existsByLabOrderIdAndLabTestIdAndDeletedAtIsNull(
            Long labOrderId,
            Long labTestId
    );
}