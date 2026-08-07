package com.medcore.features.doctor.entity;

import com.medcore.common.entity.BaseEntity;
import com.medcore.features.department.entity.Department;
import com.medcore.features.doctor.enums.DoctorStatus;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "doctors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(nullable = false, length = 100)
    private String specialization;

    @Column(nullable = false)
    private Integer experienceYears;

    @Column(nullable = false)
    private BigDecimal consultationFee;

    @Column(length = 255)
    private String qualification;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DoctorStatus status;
}