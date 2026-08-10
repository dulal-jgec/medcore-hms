package com.medcore.features.billing.dto.response;

import com.medcore.features.billing.enums.BillingStatus;
import com.medcore.features.billing.enums.PaymentMethod;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class PaymentResponse {

    private Long billId;

    private BigDecimal totalAmount;

    private BigDecimal paidAmount;

    private BigDecimal dueAmount;

    private BigDecimal paidNow;

    private PaymentMethod paymentMethod;

    private BillingStatus status;

    private LocalDateTime paidAt;
}