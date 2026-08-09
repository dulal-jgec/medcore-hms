package com.medcore.features.prescription.mapper;

import com.medcore.features.appointment.entity.Appointment;
import com.medcore.features.doctor.entity.Doctor;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.patient.entity.Patient;
import com.medcore.features.prescription.dto.request.CreatePrescriptionRequest;
import com.medcore.features.prescription.dto.response.PrescriptionResponse;
import com.medcore.features.prescription.entity.Prescription;
import com.medcore.features.prescription.enums.PrescriptionStatus;
import org.springframework.stereotype.Component;
import com.medcore.features.prescription.dto.response.PrescriptionItemResponse;

import java.util.List;
import java.time.LocalDateTime;

@Component
public class PrescriptionMapper {

    public Prescription toEntity(
            CreatePrescriptionRequest request,
            Appointment appointment,
            Doctor doctor,
            Patient patient,
            Hospital hospital) {

        return Prescription.builder()
                .appointment(appointment)
                .doctor(doctor)
                .patient(patient)
                .hospital(hospital)
                .prescriptionDate(LocalDateTime.now())
                .status(PrescriptionStatus.DRAFT)
                .build();
    }

    public PrescriptionResponse toResponse(
            Prescription prescription,
            List<PrescriptionItemResponse> medicines) {

        return PrescriptionResponse.builder()
                .id(prescription.getId())
                .appointmentId(
                        prescription.getAppointment().getId()
                )
                .doctorId(
                        prescription.getDoctor().getId()
                )
                .doctorName(
                        prescription.getDoctor()
                                .getUser()
                                .getFullName()
                )
                .patientId(
                        prescription.getPatient().getId()
                )
                .patientName(
                        prescription.getPatient()
                                .getUser()
                                .getFullName()
                )
                .hospitalId(
                        prescription.getHospital().getId()
                )
                .hospitalName(
                        prescription.getHospital().getName()
                )
                .prescriptionDate(
                        prescription.getPrescriptionDate()
                )
                .status(
                        prescription.getStatus()
                )
                .medicines(medicines)
                .createdAt(
                        prescription.getCreatedAt()
                )
                .build();
    }
}