package com.medcore.features.patient.dto.response;

import com.medcore.features.patient.enums.BloodGroup;
import com.medcore.features.patient.enums.PatientStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class PatientResponse {

    private Long id;

    private Long userId;

    private String patientName;

    private String email;

    private Long hospitalId;

    private String hospitalName;

    private LocalDate dateOfBirth;

    private BloodGroup bloodGroup;

    private String emergencyContactName;

    private String emergencyContactPhone;

    private PatientStatus status;

    private LocalDateTime createdAt;
}