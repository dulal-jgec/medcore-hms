package com.medcore.features.accountant.dto.response;

import com.medcore.features.billing.enums.PaymentMethod;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class PaymentMethodCollectionResponse {

    private PaymentMethod paymentMethod;

    private long transactionCount;

    private BigDecimal collectedAmount;
}