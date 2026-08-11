package com.medcore.features.lab.entity;

import com.medcore.common.entity.BaseEntity;
import com.medcore.features.appointment.entity.Appointment;
import com.medcore.features.doctor.entity.Doctor;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.lab.enums.LabOrderStatus;
import com.medcore.features.patient.entity.Patient;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "lab_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabOrder extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private LabOrderStatus status = LabOrderStatus.ORDERED;

    @Column(length = 500)
    private String clinicalNotes;

    @OneToMany(
            mappedBy = "labOrder",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private List<LabOrderItem> items = new ArrayList<>();
}