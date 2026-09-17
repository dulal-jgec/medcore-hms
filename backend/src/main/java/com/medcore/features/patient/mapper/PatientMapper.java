package com.medcore.features.patient.mapper;

import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.patient.dto.request.CreatePatientRequest;
import com.medcore.features.patient.dto.request.UpdatePatientRequest;
import com.medcore.features.patient.dto.response.PatientResponse;
import com.medcore.features.patient.entity.Patient;
import com.medcore.features.patient.enums.PatientStatus;
import com.medcore.features.user.entity.User;
import org.springframework.stereotype.Component;
import java.util.ArrayList;

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
                .emergencyContactName(
                        request.getEmergencyContactName().trim()
                )
                .emergencyContactPhone(
                        request.getEmergencyContactPhone().trim()
                )
                .emergencyContactRelation(
                        request.getEmergencyContactRelation().trim()
                )
                .allergies(request.getAllergies())
                .chronicConditions(request.getChronicConditions())
                .status(PatientStatus.ACTIVE)
                .build();
    }

    public PatientResponse toResponse(Patient patient) {

    User user = patient.getUser();

    return PatientResponse.builder()
            .id(patient.getId())
            .userId(user.getId())
            .patientName(user.getFullName())
            .email(user.getEmail())
            .phone(user.getPhone())

            .city(user.getCity())
            .state(user.getState())
            .pincode(user.getPincode())
            .occupation(user.getOccupation())
            .gender(user.getGender())
            .maritalStatus(user.getMaritalStatus())

            .hospitalId(patient.getHospital().getId())
            .hospitalName(patient.getHospital().getName())

            .dateOfBirth(patient.getDateOfBirth())
            .bloodGroup(patient.getBloodGroup())

            .emergencyContactName(
                    patient.getEmergencyContactName()
            )
            .emergencyContactPhone(
                    patient.getEmergencyContactPhone()
            )
            .emergencyContactRelation(
                    patient.getEmergencyContactRelation()
            )

            .allergies(
            	    patient.getAllergies() != null
            	        ? new ArrayList<>(patient.getAllergies())
            	        : new ArrayList<>()
            	)
            	.chronicConditions(
            	    patient.getChronicConditions() != null
            	        ? new ArrayList<>(patient.getChronicConditions())
            	        : new ArrayList<>()
            	)

            .status(patient.getStatus())
            .createdAt(patient.getCreatedAt())
            .build();
}

    public void updateEntity(
            Patient patient,
            UpdatePatientRequest request) {

        patient.setDateOfBirth(
                request.getDateOfBirth()
        );

        patient.setBloodGroup(
                request.getBloodGroup()
        );

        patient.setEmergencyContactName(
                request.getEmergencyContactName().trim()
        );

        patient.setEmergencyContactPhone(
                request.getEmergencyContactPhone().trim()
        );

        patient.setEmergencyContactRelation(
                request.getEmergencyContactRelation().trim()
        );

        patient.setAllergies(
                request.getAllergies()
        );

        patient.setChronicConditions(
                request.getChronicConditions()
        );
    }
}