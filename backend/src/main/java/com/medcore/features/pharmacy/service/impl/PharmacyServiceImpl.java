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

import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PharmacyServiceImpl
        implements PharmacyService {

    private static final Logger log =
            LoggerFactory.getLogger(
                    PharmacyServiceImpl.class
            );

    private final PharmacyRepository pharmacyRepository;
    private final HospitalRepository hospitalRepository;
    private final PharmacyMapper pharmacyMapper;
    private final TenantContextService tenantContextService;


    @Override
    @Transactional
    public ApiResponse<PharmacyResponse> createPharmacy(
            CreatePharmacyRequest request) {

        Long hospitalId =
                getCurrentHospitalId();

        Hospital hospital =
                hospitalRepository
                        .findByIdAndDeletedAtIsNull(
                                hospitalId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Hospital not found"
                                ));

        if (pharmacyRepository
                .existsByHospitalIdAndDeletedAtIsNull(
                        hospitalId
                )) {

            log.warn(
                    "Pharmacy creation rejected: hospitalId={}, reason=already_exists",
                    hospitalId
            );

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
                pharmacyRepository.save(
                        pharmacy
                );

        log.info(
                "Pharmacy created successfully: pharmacyId={}, hospitalId={}",
                savedPharmacy.getId(),
                hospitalId
        );

        return ApiResponse.<PharmacyResponse>builder()
                .success(true)
                .message(
                        "Pharmacy created successfully"
                )
                .data(
                        pharmacyMapper.toResponse(
                                savedPharmacy
                        )
                )
                .build();
    }


    @Override
    public ApiResponse<PharmacyResponse> getMyPharmacy() {

        Long hospitalId =
                getCurrentHospitalId();

        Pharmacy pharmacy =
                pharmacyRepository
                        .findByHospitalIdAndDeletedAtIsNull(
                                hospitalId
                        )
                        .orElseThrow(() -> {

                            log.warn(
                                    "Pharmacy not found: hospitalId={}",
                                    hospitalId
                            );

                            return new ResourceNotFoundException(
                                    "Pharmacy not found"
                            );
                        });

        log.debug(
                "Pharmacy fetched successfully: pharmacyId={}, hospitalId={}",
                pharmacy.getId(),
                hospitalId
        );

        return ApiResponse.<PharmacyResponse>builder()
                .success(true)
                .message(
                        "Pharmacy fetched successfully"
                )
                .data(
                        pharmacyMapper.toResponse(
                                pharmacy
                        )
                )
                .build();
    }


    private Long getCurrentHospitalId() {

        Long hospitalId =
                tenantContextService
                        .getCurrentHospitalId();

        if (hospitalId == null) {

            log.warn(
                    "Pharmacy operation rejected: hospital context is missing"
            );

            throw new BusinessException(
                    "User is not associated with a hospital"
            );
        }

        return hospitalId;
    }
}