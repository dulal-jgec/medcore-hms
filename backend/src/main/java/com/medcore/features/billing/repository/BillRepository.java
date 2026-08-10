package com.medcore.features.billing.repository;

import com.medcore.features.billing.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BillRepository
        extends JpaRepository<Bill, Long> {

    Optional<Bill> findByIdAndDeletedAtIsNull(Long id);

    boolean existsByAppointmentIdAndDeletedAtIsNull(
            Long appointmentId
    );
}