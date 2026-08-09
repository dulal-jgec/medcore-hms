package com.medcore.features.prescription.entity;

import com.medcore.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "prescription_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;

    // Existing medicine from medicine master
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicine_id")
    private Medicine medicine;

    // Doctor can manually type medicine
    @Column(nullable = false, length = 150)
    private String medicineName;

    @Column(length = 100)
    private String strength;

    @Column(nullable = false, length = 100)
    private String dosage;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, length = 100)
    private String frequency;

    @Column(nullable = false, length = 50)
    private String duration;

    @Column(length = 255)
    private String instructions;
}