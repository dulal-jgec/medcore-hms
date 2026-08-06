package com.medcore.features.department.entity;

import com.medcore.common.entity.BaseEntity;
import com.medcore.features.department.enums.DepartmentStatus;
import com.medcore.features.hospital.entity.Hospital;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "departments",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"hospital_id", "code"}),
                @UniqueConstraint(columnNames = {"hospital_id", "name"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 20)
    private String code;

    @Column(length = 500)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DepartmentStatus status;
}