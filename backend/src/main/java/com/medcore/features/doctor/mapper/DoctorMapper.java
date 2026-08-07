package com.medcore.features.doctor.mapper;

import com.medcore.features.department.entity.Department;
import com.medcore.features.doctor.dto.request.CreateDoctorRequest;
import com.medcore.features.doctor.dto.request.UpdateDoctorRequest;
import com.medcore.features.doctor.dto.response.DoctorResponse;
import com.medcore.features.doctor.entity.Doctor;
import com.medcore.features.doctor.enums.DoctorStatus;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.user.entity.User;
import org.springframework.stereotype.Component;

@Component
public class DoctorMapper {

    public Doctor toEntity(CreateDoctorRequest request,
                           User user,
                           Hospital hospital,
                           Department department) {

        return Doctor.builder()
                .user(user)
                .hospital(hospital)
                .department(department)
                .specialization(request.getSpecialization().trim())
                .experienceYears(request.getExperienceYears())
                .consultationFee(request.getConsultationFee())
                .qualification(request.getQualification().trim())
                .status(DoctorStatus.ACTIVE)
                .build();
    }

    public DoctorResponse toResponse(Doctor doctor) {

        return DoctorResponse.builder()
                .id(doctor.getId())
                .userId(doctor.getUser().getId())
                .doctorName(doctor.getUser().getFullName())
                .email(doctor.getUser().getEmail())
                .hospitalId(doctor.getHospital().getId())
                .hospitalName(doctor.getHospital().getName())
                .departmentId(doctor.getDepartment().getId())
                .departmentName(doctor.getDepartment().getName())
                .specialization(doctor.getSpecialization())
                .experienceYears(doctor.getExperienceYears())
                .consultationFee(doctor.getConsultationFee())
                .qualification(doctor.getQualification())
                .status(doctor.getStatus())
                .createdAt(doctor.getCreatedAt())
                .build();
    }
    
    public void updateEntity(
            Doctor doctor,
            UpdateDoctorRequest request) {

        doctor.setSpecialization(request.getSpecialization().trim());
        doctor.setExperienceYears(request.getExperienceYears());
        doctor.setConsultationFee(request.getConsultationFee());
        doctor.setQualification(request.getQualification().trim());
    }
}