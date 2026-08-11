package com.medcore.features.lab.entity;

import com.medcore.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "lab_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabResult extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lab_order_item_id", nullable = false, unique = true)
    private LabOrderItem labOrderItem;

    @Column(length = 255)
    private String resultValue;

    @Column(length = 100)
    private String unit;

    @Column(length = 100)
    private String referenceRange;

    @Column(length = 1000)
    private String remarks;

    @Column(nullable = false)
    @Builder.Default
    private Boolean abnormal = false;

    private LocalDateTime resultDate;
}