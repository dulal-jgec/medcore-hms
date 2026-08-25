package com.medcore.features.payment.repository;

import com.medcore.features.payment.entity.Payment;
import com.medcore.features.payment.enums.PaymentStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository
        extends JpaRepository<Payment, Long> {

    Optional<Payment> findByGatewayOrderId(
            String gatewayOrderId
    );

    Optional<Payment> findByGatewayPaymentId(
            String gatewayPaymentId
    );

    boolean existsByGatewayPaymentId(
            String gatewayPaymentId
    );

    boolean existsByBillIdAndStatus(
            Long billId,
            PaymentStatus status
    );
}