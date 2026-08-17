package com.medcore.features.pharmacy.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
 import com.medcore.common.security.TenantContextService;

import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.repository.HospitalRepository;

import com.medcore.features.pharmacy.dto.request.CreatePharmacyRequest;
import com.medcore.features.pharmacy.dto.response.PharmacyResponse;
import com.medcore.features.pharmacy.entity.Pharmacy;
import com.medcore.features.pharmacy.mapper.PharmacyMapper;
import com.medcore.features.pharmacy.repository.PharmacyRepository;
import com.medcore.features.pharmacy.service.PharmacyService;

 import com.medcore.features.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PharmacyServiceImpl
        implements PharmacyService {

    private final PharmacyRepository pharmacyRepository;
    private final HospitalRepository hospitalRepository;
    private final UserRepository userRepository;
    private final PharmacyMapper pharmacyMapper;
    private final TenantContextService tenantContextService;

    @Override
    public ApiResponse<PharmacyResponse> createPharmacy(
            CreatePharmacyRequest request) {

        Long hospitalId = getCurrentHospitalId();

        Hospital hospital =
                hospitalRepository
                        .findByIdAndDeletedAtIsNull(hospitalId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Hospital not found"
                                ));

        if (pharmacyRepository
                .existsByHospitalIdAndDeletedAtIsNull(
                        hospitalId
                )) {

            throw new BusinessException(
                    "Pharmacy already exists for this hospital"
            );
        }

        Pharmacy pharmacy =
                pharmacyMapper.toEntity(
                        request,
                        hospital
                );

        Pharmacy savedPharmacy =
                pharmacyRepository.save(pharmacy);

        return ApiResponse.<PharmacyResponse>builder()
                .success(true)
                .message("Pharmacy created successfully")
                .data(
                        pharmacyMapper.toResponse(
                                savedPharmacy
                        )
                )
                .build();
    }

    @Override
    public ApiResponse<PharmacyResponse> getMyPharmacy() {

        Long hospitalId = getCurrentHospitalId();

        Pharmacy pharmacy =
                pharmacyRepository
                        .findByHospitalIdAndDeletedAtIsNull(
                                hospitalId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Pharmacy not found"
                                ));

        return ApiResponse.<PharmacyResponse>builder()
                .success(true)
                .message("Pharmacy fetched successfully")
                .data(
                        pharmacyMapper.toResponse(
                                pharmacy
                        )
                )
                .build();
    }

    private Long getCurrentHospitalId() {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        if (hospitalId == null) {
            throw new BusinessException(
                    "User is not associated with a hospital"
            );
        }

        return hospitalId;
    }
}