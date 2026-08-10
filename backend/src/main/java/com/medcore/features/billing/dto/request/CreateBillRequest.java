package com.medcore.features.billing.dto.request;

import com.medcore.features.billing.enums.BillType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateBillRequest {

    private Long appointmentId;

    @NotNull(message = "Bill type is required")
    private BillType billType;

    @NotNull(message = "Subtotal is required")
    @DecimalMin(value = "0.0", message = "Subtotal cannot be negative")
    private BigDecimal subtotal;

    @DecimalMin(value = "0.0", message = "Discount cannot be negative")
    @Builder.Default
    private BigDecimal discount = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "Tax cannot be negative")
    @Builder.Default
    private BigDecimal tax = BigDecimal.ZERO;
}