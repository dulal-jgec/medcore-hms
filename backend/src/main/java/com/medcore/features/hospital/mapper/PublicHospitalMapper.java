package com.medcore.features.hospital.mapper;

import com.medcore.features.hospital.dto.response.PublicHospitalResponse;
import com.medcore.features.hospital.entity.Hospital;

import org.springframework.stereotype.Component;

@Component
public class PublicHospitalMapper {

    public PublicHospitalResponse toResponse(
            Hospital hospital) {

        return PublicHospitalResponse
                .builder()
                .id(hospital.getId())
                .name(hospital.getName())
                .email(hospital.getEmail())
                .phone(hospital.getPhone())
                .city(hospital.getCity())
                .state(hospital.getState())
                .address(hospital.getAddress())
                .pincode(hospital.getPincode())
                .emergencyPhone(hospital.getEmergencyPhone())
                .description(hospital.getDescription())
                .logoUrl(hospital.getLogoUrl())
                .bannerUrl(hospital.getBannerUrl())
                .website(hospital.getWebsite())
                .build();
    }
}