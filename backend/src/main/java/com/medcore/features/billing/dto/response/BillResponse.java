package com.medcore.features.billing.dto.response;

import com.medcore.features.billing.enums.BillType;
import com.medcore.features.billing.enums.BillingStatus;
import com.medcore.features.billing.enums.PaymentMethod;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillResponse {

    private Long id;

    private Long patientId;
    private Long hospitalId;
    private Long appointmentId;

    private BillType billType;
    private BillingStatus status;

    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal tax;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;

    private PaymentMethod paymentMethod;

    private LocalDateTime billDate;
    private LocalDateTime paidAt;

    private List<BillItemResponse> items;
}