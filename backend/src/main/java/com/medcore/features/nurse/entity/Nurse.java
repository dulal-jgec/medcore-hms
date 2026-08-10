package com.medcore.features.nurse.entity;

import com.medcore.common.entity.BaseEntity;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.nurse.enums.NurseStatus;
import com.medcore.features.user.entity.User;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "nurses",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_nurse_user",
                        columnNames = "user_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Nurse extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            unique = true
    )
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "hospital_id",
            nullable = false
    )
    private Hospital hospital;

    @Column(nullable = false, length = 100)
    private String department;

    @Column(length = 100)
    private String ward;

    @Column(length = 100)
    private String designation;

    @Column(length = 100)
    private String qualification;

    @Column(length = 50)
    private String licenseNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private NurseStatus status = NurseStatus.ACTIVE;
}