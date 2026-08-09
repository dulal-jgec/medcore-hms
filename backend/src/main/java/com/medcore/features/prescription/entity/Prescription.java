package com.medcore.features.prescription.entity;

import com.medcore.common.entity.BaseEntity;
import com.medcore.features.appointment.entity.Appointment;
import com.medcore.features.doctor.entity.Doctor;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.patient.entity.Patient;
import com.medcore.features.prescription.enums.PrescriptionStatus;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;

@Entity
@Table(name = "prescriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prescription extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "appointment_id",
            nullable = false,
            unique = true
    )
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;

    @Column(nullable = false)
    private LocalDateTime prescriptionDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PrescriptionStatus status;

    @Column(nullable = false)
    @Builder.Default
    private Boolean sharedWithPatient = false;

    // Prescription → PrescriptionItems
    @OneToMany(
            mappedBy = "prescription",
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<PrescriptionItem> items = new ArrayList<>();
}