package com.medcore.features.patient.entity;

import com.medcore.common.entity.BaseEntity;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.patient.enums.BloodGroup;
import com.medcore.features.patient.enums.PatientStatus;
import com.medcore.features.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "patients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;

    @Column(nullable = false)
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BloodGroup bloodGroup;

    @Column(length = 255)
    private String emergencyContactName;

    @Column(length = 20)
    private String emergencyContactPhone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PatientStatus status;

    @Column(length = 100)
    private String emergencyContactRelation;

    @Builder.Default
    @ElementCollection
    @CollectionTable(
        name = "patient_allergies",
        joinColumns = @JoinColumn(name = "patient_id")
    )
    @Column(name = "allergy")
    private List<String> allergies = new ArrayList<>();

    @Builder.Default
    @ElementCollection
    @CollectionTable(
        name = "patient_chronic_conditions",
        joinColumns = @JoinColumn(name = "patient_id")
    )
    @Column(name = "condition_name")
    private List<String> chronicConditions = new ArrayList<>();
}