package com.medcore.features.lab.entity;

import com.medcore.common.entity.BaseEntity;
import com.medcore.features.lab.enums.LabTestCategory;
import com.medcore.features.lab.enums.LabTestStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "lab_tests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabTest extends BaseEntity {

    @Column(nullable = false, unique = true, length = 150)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private LabTestCategory category;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private LabTestStatus status = LabTestStatus.ACTIVE;
}