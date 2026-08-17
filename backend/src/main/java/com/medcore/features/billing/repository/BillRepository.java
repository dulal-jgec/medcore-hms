package com.medcore.features.billing.repository;

import com.medcore.features.billing.entity.Bill;
import com.medcore.features.billing.enums.BillingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BillRepository
        extends JpaRepository<Bill, Long> {

    Optional<Bill> findByIdAndDeletedAtIsNull(
            Long id
    );

    Optional<Bill> findByIdAndHospitalIdAndDeletedAtIsNull(
            Long id,
            Long hospitalId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT b
            FROM Bill b
            WHERE b.id = :billId
            AND b.hospital.id = :hospitalId
            AND b.deletedAt IS NULL
            """)
    Optional<Bill> findByIdAndHospitalIdForUpdate(
            @Param("billId") Long billId,
            @Param("hospitalId") Long hospitalId
    );

    boolean existsByAppointmentIdAndDeletedAtIsNull(
            Long appointmentId
    );

    Page<Bill> findByHospitalIdAndDeletedAtIsNull(
            Long hospitalId,
            Pageable pageable
    );

    Page<Bill> findByHospitalIdAndStatusInAndDeletedAtIsNull(
            Long hospitalId,
            List<BillingStatus> statuses,
            Pageable pageable
    );

    @Query("""
            SELECT
                COUNT(b.id),
                COALESCE(SUM(b.totalAmount), 0),
                COALESCE(SUM(b.paidAmount), 0)
            FROM Bill b
            WHERE b.hospital.id = :hospitalId
            AND b.deletedAt IS NULL
            AND b.status <> :cancelledStatus
            """)
    Object[] getFinancialSummary(
            @Param("hospitalId") Long hospitalId,
            @Param("cancelledStatus") BillingStatus cancelledStatus
    );

    @Query("""
            SELECT
                COUNT(b.id),
                COALESCE(SUM(b.totalAmount), 0),
                COALESCE(SUM(b.paidAmount), 0)
            FROM Bill b
            WHERE b.hospital.id = :hospitalId
            AND b.billDate >= :fromDateTime
            AND b.billDate < :toDateTime
            AND b.deletedAt IS NULL
            AND b.status <> :cancelledStatus
            """)
    Object[] getFinancialReport(
            @Param("hospitalId") Long hospitalId,
            @Param("fromDateTime") LocalDateTime fromDateTime,
            @Param("toDateTime") LocalDateTime toDateTime,
            @Param("cancelledStatus") BillingStatus cancelledStatus
    );

    @Query("""
            SELECT
                b.paymentMethod,
                COUNT(b.id),
                COALESCE(SUM(b.paidAmount), 0)
            FROM Bill b
            WHERE b.hospital.id = :hospitalId
            AND b.deletedAt IS NULL
            AND b.status <> :cancelledStatus
            AND b.paymentMethod IS NOT NULL
            GROUP BY b.paymentMethod
            """)
    List<Object[]> getPaymentMethodCollection(
            @Param("hospitalId") Long hospitalId,
            @Param("cancelledStatus") BillingStatus cancelledStatus
    );

    long countByHospitalIdAndStatusInAndDeletedAtIsNull(
            Long hospitalId,
            List<BillingStatus> statuses
    );
}