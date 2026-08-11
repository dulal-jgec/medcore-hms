package com.medcore.features.lab.mapper;

import com.medcore.features.appointment.entity.Appointment;
import com.medcore.features.doctor.entity.Doctor;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.lab.dto.request.CreateLabOrderRequest;
import com.medcore.features.lab.dto.response.LabOrderItemResponse;
import com.medcore.features.lab.dto.response.LabOrderResponse;
import com.medcore.features.lab.entity.LabOrder;
import com.medcore.features.patient.entity.Patient;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class LabOrderMapper {

    public LabOrder toEntity(
            CreateLabOrderRequest request,
            Appointment appointment,
            Doctor doctor,
            Patient patient,
            Hospital hospital) {

        return LabOrder.builder()
                .appointment(appointment)
                .doctor(doctor)
                .patient(patient)
                .hospital(hospital)
                .clinicalNotes(request.getClinicalNotes())
                .build();
    }

    public LabOrderResponse toResponse(
            LabOrder labOrder,
            List<LabOrderItemResponse> items) {

        return LabOrderResponse.builder()
                .id(labOrder.getId())
                .patientId(
                        labOrder.getPatient().getId()
                )
                .doctorId(
                        labOrder.getDoctor().getId()
                )
                .hospitalId(
                        labOrder.getHospital().getId()
                )
                .appointmentId(
                        labOrder.getAppointment() != null
                                ? labOrder.getAppointment().getId()
                                : null
                )
                .status(labOrder.getStatus())
                .clinicalNotes(labOrder.getClinicalNotes())
                .createdAt(labOrder.getCreatedAt())
                .items(items)
                .build();
    }
}