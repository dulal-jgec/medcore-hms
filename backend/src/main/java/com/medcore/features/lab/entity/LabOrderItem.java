package com.medcore.features.lab.entity;

import com.medcore.common.entity.BaseEntity;
 
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lab_order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabOrderItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lab_order_id", nullable = false)
    private LabOrder labOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lab_test_id", nullable = false)
    private LabTest labTest;

    @Column(length = 500)
    private String instructions;
}