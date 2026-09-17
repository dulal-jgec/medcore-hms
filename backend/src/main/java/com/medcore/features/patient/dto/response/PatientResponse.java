package com.medcore.features.patient.dto.response;

import com.medcore.features.patient.enums.BloodGroup;
import com.medcore.features.patient.enums.PatientStatus;
import com.medcore.features.user.enums.Gender;
import com.medcore.features.user.enums.MaritalStatus;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
public class PatientResponse {

	private Long id;
	private Long userId;

	private String patientName;
	private String email;
	private String phone;

	private String city;
	private String state;
	private String pincode;
	private String occupation;

	private Gender gender;
	private MaritalStatus maritalStatus;

	private Long hospitalId;
	private String hospitalName;

	private LocalDate dateOfBirth;
	private BloodGroup bloodGroup;

	private String emergencyContactName;
	private String emergencyContactPhone;
	private String emergencyContactRelation;

	private List<String> allergies;
	private List<String> chronicConditions;

	private PatientStatus status;
	private LocalDateTime createdAt;
}