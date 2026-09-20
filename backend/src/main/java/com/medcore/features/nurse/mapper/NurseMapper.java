package com.medcore.features.nurse.mapper;

import com.medcore.features.nurse.dto.request.CreateNurseRequest;
import com.medcore.features.nurse.dto.request.UpdateMyNurseProfileRequest;
import com.medcore.features.nurse.dto.request.UpdateNurseRequest;
import com.medcore.features.nurse.dto.response.NurseProfileResponse;
import com.medcore.features.nurse.dto.response.NurseResponse;
import com.medcore.features.nurse.entity.Nurse;
import com.medcore.features.user.entity.User;
import org.springframework.stereotype.Component;

@Component
public class NurseMapper {

    public Nurse toEntity(
            CreateNurseRequest request,
            User user) {

        return Nurse.builder()
                .user(user)
                .hospital(user.getHospital())
                .department(request.getDepartment())
                .ward(request.getWard())
                .designation(request.getDesignation())
                .qualification(request.getQualification())
                .licenseNumber(request.getLicenseNumber())
                .build();
    }

    public void updateEntity(
            Nurse nurse,
            UpdateNurseRequest request) {

        nurse.setDepartment(request.getDepartment());
        nurse.setWard(request.getWard());
        nurse.setDesignation(request.getDesignation());
        nurse.setQualification(request.getQualification());
        nurse.setLicenseNumber(request.getLicenseNumber());
    }

    public NurseResponse toResponse(Nurse nurse) {

        User user = nurse.getUser();

        return NurseResponse.builder()
                .id(nurse.getId())
                .userId(user.getId())
                .name(user.getFullName())
                .email(user.getEmail())
                .hospitalId(
                        nurse.getHospital() != null
                                ? nurse.getHospital().getId()
                                : null
                )
                .department(nurse.getDepartment())
                .ward(nurse.getWard())
                .designation(nurse.getDesignation())
                .qualification(nurse.getQualification())
                .licenseNumber(nurse.getLicenseNumber())
                .status(nurse.getStatus())
                .build();
    }
    
    public NurseProfileResponse toProfileResponse(
            Nurse nurse) {

        User user = nurse.getUser();

        return NurseProfileResponse.builder()
                .id(nurse.getId())
                .userId(user.getId())
                .name(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .profileImageUrl(nurse.getProfileImageUrl())
                .bio(nurse.getBio())
                .languages(nurse.getLanguages())
                .emergencyContact(
                        nurse.getEmergencyContact()
                )
                .hospitalId(
                        nurse.getHospital().getId()
                )
                .hospitalName(
                        nurse.getHospital().getName()
                )
                .department(nurse.getDepartment())
                .ward(nurse.getWard())
                .designation(nurse.getDesignation())
                .qualification(nurse.getQualification())
                .licenseNumber(nurse.getLicenseNumber())
                .status(nurse.getStatus())
                .createdAt(nurse.getCreatedAt())
                .build();
    }
    
    public void updateMyProfile(
            Nurse nurse,
            UpdateMyNurseProfileRequest request) {

        if (request.getBio() != null) {
            nurse.setBio(request.getBio().trim());
        }

        if (request.getLanguages() != null) {
            nurse.setLanguages(request.getLanguages().trim());
        }

        if (request.getEmergencyContact() != null) {
            nurse.setEmergencyContact(
                    request.getEmergencyContact().trim()
            );
        }
    }
}