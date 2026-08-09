package com.medcore.features.pharmacy.mapper;

import com.medcore.features.pharmacy.dto.request.CreatePharmacyRequest;
import com.medcore.features.pharmacy.dto.response.PharmacyResponse;
import com.medcore.features.pharmacy.entity.Pharmacy;
import com.medcore.features.hospital.entity.Hospital;
import org.springframework.stereotype.Component;

@Component
public class PharmacyMapper {

    public Pharmacy toEntity(
            CreatePharmacyRequest request,
            Hospital hospital) {

        return Pharmacy.builder()
                .name(request.getName())
                .address(request.getAddress())
                .phone(request.getPhone())
                .active(true)
                .hospital(hospital)
                .build();
    }

    public PharmacyResponse toResponse(
            Pharmacy pharmacy) {

        return PharmacyResponse.builder()
                .id(pharmacy.getId())
                .name(pharmacy.getName())
                .address(pharmacy.getAddress())
                .phone(pharmacy.getPhone())
                .active(pharmacy.getActive())
                .hospitalId(
                        pharmacy.getHospital().getId()
                )
                .build();
    }
}