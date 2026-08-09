package com.medcore.features.pharmacy.entity;

import com.medcore.common.entity.BaseEntity;
import com.medcore.features.prescription.entity.Medicine;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(
        name = "pharmacy_inventory",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_pharmacy_medicine_batch",
                        columnNames = {
                                "pharmacy_id",
                                "medicine_id",
                                "batch_number"
                        }
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PharmacyInventory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "pharmacy_id",
            nullable = false
    )
    private Pharmacy pharmacy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "medicine_id",
            nullable = false
    )
    private Medicine medicine;

    @Column(
            name = "batch_number",
            nullable = false,
            length = 100
    )
    private String batchNumber;

    @Column(
            name = "stock_quantity",
            nullable = false
    )
    private Integer stockQuantity;

    @Column(
            name = "selling_price",
            nullable = false,
            precision = 10,
            scale = 2
    )
    private BigDecimal sellingPrice;

    @Column(
            name = "expiry_date",
            nullable = false
    )
    private LocalDate expiryDate;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}