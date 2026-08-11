package com.medcore.features.receptionist.entity;

import com.medcore.common.entity.BaseEntity;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.receptionist.enums.ReceptionistStatus;
import com.medcore.features.user.entity.User;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "receptionists",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_receptionist_user",
                        columnNames = "user_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Receptionist extends BaseEntity {

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

    @Column(length = 100)
    private String designation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ReceptionistStatus status =
            ReceptionistStatus.ACTIVE;
}