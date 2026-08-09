package com.medcore.features.pharmacy.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddInventoryRequest {

    @NotNull
    private Long medicineId;

    @NotBlank
    @Size(max = 100)
    private String batchNumber;

    @NotNull
    @Min(0)
    private Integer stockQuantity;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal sellingPrice;

    @NotNull
    @Future
    private LocalDate expiryDate;
}