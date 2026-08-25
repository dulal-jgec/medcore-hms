package com.medcore.features.payment.entity;

import com.medcore.common.entity.BaseEntity;
import com.medcore.features.billing.entity.Bill;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.patient.entity.Patient;
import com.medcore.features.payment.enums.PaymentMethod;
import com.medcore.features.payment.enums.PaymentStatus;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "payments",
        indexes = {
                @Index(
                        name = "idx_payment_hospital",
                        columnList = "hospital_id"
                ),
                @Index(
                        name = "idx_payment_order",
                        columnList = "gateway_order_id"
                ),
                @Index(
                        name = "idx_payment_gateway_payment",
                        columnList = "gateway_payment_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "hospital_id",
            nullable = false
    )
    private Hospital hospital;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "patient_id",
            nullable = false
    )
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "bill_id",
            nullable = false
    )
    private Bill bill;

    @Column(
            name = "gateway_order_id",
            unique = true,
            length = 100
    )
    private String gatewayOrderId;

    @Column(
            name = "gateway_payment_id",
            unique = true,
            length = 100
    )
    private String gatewayPaymentId;

    @Column(
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal amount;

    @Column(
            nullable = false,
            length = 10
    )
    @Builder.Default
    private String currency = "INR";

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    @Builder.Default
    private PaymentStatus status =
            PaymentStatus.CREATED;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private PaymentMethod paymentMethod;

    private LocalDateTime paidAt;
}