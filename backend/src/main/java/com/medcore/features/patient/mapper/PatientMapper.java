package com.medcore.features.patient.mapper;

import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.patient.dto.request.CreatePatientRequest;
import com.medcore.features.patient.dto.request.UpdatePatientRequest;
import com.medcore.features.patient.dto.response.PatientResponse;
import com.medcore.features.patient.entity.Patient;
import com.medcore.features.patient.enums.PatientStatus;
import com.medcore.features.user.entity.User;
import org.springframework.stereotype.Component;

@Component
public class PatientMapper {

    public Patient toEntity(
            CreatePatientRequest request,
            User user,
            Hospital hospital) {

        return Patient.builder()
                .user(user)
                .hospital(hospital)
                .dateOfBirth(request.getDateOfBirth())
                .bloodGroup(request.getBloodGroup())
                .emergencyContactName(request.getEmergencyContactName().trim())
                .emergencyContactPhone(request.getEmergencyContactPhone().trim())
                .status(PatientStatus.ACTIVE)
                .build();
    }

    public PatientResponse toResponse(Patient patient) {

        return PatientResponse.builder()
                .id(patient.getId())
                .userId(patient.getUser().getId())
                .patientName(patient.getUser().getFullName())
                .email(patient.getUser().getEmail())
                .hospitalId(patient.getHospital().getId())
                .hospitalName(patient.getHospital().getName())
                .dateOfBirth(patient.getDateOfBirth())
                .bloodGroup(patient.getBloodGroup())
                .emergencyContactName(patient.getEmergencyContactName())
                .emergencyContactPhone(patient.getEmergencyContactPhone())
                .status(patient.getStatus())
                .createdAt(patient.getCreatedAt())
                .build();
    }
    
    public void updateEntity(
            Patient patient,
            UpdatePatientRequest request) {

        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setEmergencyContactName(
                request.getEmergencyContactName().trim());
        patient.setEmergencyContactPhone(
                request.getEmergencyContactPhone().trim());
    }
}