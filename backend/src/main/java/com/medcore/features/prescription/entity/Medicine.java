package com.medcore.features.prescription.entity;

import com.medcore.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "medicines",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"name", "strength", "dosage_form"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medicine extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 150)
    private String genericName;

    @Column(length = 50)
    private String strength;

    @Column(name = "dosage_form", nullable = false, length = 50)
    private String dosageForm;

    @Column(nullable = false)
    private Boolean active = true;
}