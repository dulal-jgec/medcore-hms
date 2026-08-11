package com.medcore.features.accountant.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class AccountantDashboardResponse {

    private long totalBills;

    private BigDecimal totalBilledAmount;

    private BigDecimal totalPaidAmount;

    private BigDecimal totalOutstandingAmount;

    private long outstandingBills;

    private List<PaymentMethodCollectionResponse>
            paymentMethodCollection;
}