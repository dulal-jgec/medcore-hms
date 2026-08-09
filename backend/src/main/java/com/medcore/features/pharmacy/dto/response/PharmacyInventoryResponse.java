package com.medcore.features.pharmacy.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PharmacyInventoryResponse {

    private Long id;

    private Long pharmacyId;

    private Long medicineId;

    private String medicineName;

    private String strength;

    private String batchNumber;

    private Integer stockQuantity;

    private BigDecimal sellingPrice;

    private LocalDate expiryDate;

    private Boolean active;
}