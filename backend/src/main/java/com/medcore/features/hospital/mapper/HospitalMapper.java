package com.medcore.features.hospital.mapper;

import com.medcore.features.hospital.dto.request.CreateHospitalRequest;
import com.medcore.features.hospital.dto.request.UpdateHospitalRequest;
import com.medcore.features.hospital.dto.response.CreateHospitalResponse;
import com.medcore.features.hospital.entity.Hospital;
import org.springframework.stereotype.Component;
import com.medcore.features.hospital.enums.HospitalStatus;
@Component
public class HospitalMapper {

    public Hospital toEntity(CreateHospitalRequest request) {

        return Hospital.builder()
                .name(request.getName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .phone(request.getPhone().trim())
                .licenseNumber(request.getLicenseNumber().trim())
                .city(request.getCity().trim())
                .logoUrl(request.getLogo())
                .status(HospitalStatus.PENDING)
                .build();
    }

    public CreateHospitalResponse toResponse(Hospital hospital) {

        return CreateHospitalResponse.builder()
                .id(hospital.getId())
                .name(hospital.getName())
                .email(hospital.getEmail())
                .phone(hospital.getPhone())
                .licenseNumber(hospital.getLicenseNumber())
                .city(hospital.getCity())
                .logo(hospital.getLogoUrl())
                .status(hospital.getStatus())
                .createdAt(hospital.getCreatedAt())
                .build();
    }
    
    public void updateEntity(
            Hospital hospital,
            UpdateHospitalRequest request) {

        hospital.setName(request.getName().trim());
        hospital.setEmail(request.getEmail().trim().toLowerCase());
        hospital.setPhone(request.getPhone().trim());
        hospital.setLicenseNumber(request.getLicenseNumber().trim());
        hospital.setCity(request.getCity().trim());
        hospital.setLogoUrl(request.getLogo());
    }
}