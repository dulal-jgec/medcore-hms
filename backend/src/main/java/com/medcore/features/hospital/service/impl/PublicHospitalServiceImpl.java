package com.medcore.features.hospital.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.features.hospital.dto.response.PublicHospitalResponse;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.enums.HospitalStatus;
import com.medcore.features.hospital.mapper.PublicHospitalMapper;
import com.medcore.features.hospital.repository.HospitalRepository;
import com.medcore.features.hospital.service.PublicHospitalService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PublicHospitalServiceImpl
        implements PublicHospitalService {

    private final HospitalRepository hospitalRepository;
    private final PublicHospitalMapper publicHospitalMapper;

    private static final Set<String> ALLOWED_SORT_FIELDS =
            Set.of(
                    "id",
                    "name",
                    "city",
                    "createdAt"
            );

    @Override
    public ApiResponse<Page<PublicHospitalResponse>> getHospitals(
            int page,
            int size,
            String sortBy,
            String sortDir) {

        if (page < 0) {
            throw new BusinessException(
                    "Page must be greater than or equal to 0"
            );
        }

        if (size < 1 || size > 100) {
            throw new BusinessException(
                    "Page size must be between 1 and 100"
            );
        }

        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            throw new BusinessException(
                    "Invalid sort field: " + sortBy
            );
        }

        String normalizedSortDir =
                sortDir == null
                        ? "asc"
                        : sortDir.trim().toLowerCase();

        if (!normalizedSortDir.equals("asc")
                && !normalizedSortDir.equals("desc")) {

            throw new BusinessException(
                    "Sort direction must be 'asc' or 'desc'"
            );
        }

        Sort sort =
                normalizedSortDir.equals("desc")
                        ? Sort.by(sortBy).descending()
                        : Sort.by(sortBy).ascending();

        Pageable pageable =
                PageRequest.of(page, size, sort);

        Page<Hospital> hospitalPage =
                hospitalRepository.findByStatusAndDeletedAtIsNull(
                        HospitalStatus.ACTIVE,
                        pageable
                );

        Page<PublicHospitalResponse> responsePage =
                hospitalPage.map(
                        publicHospitalMapper::toResponse
                );

        return ApiResponse
                .<Page<PublicHospitalResponse>>builder()
                .success(true)
                .message("Hospitals fetched successfully")
                .data(responsePage)
                .build();
    }

    @Override
    public ApiResponse<PublicHospitalResponse> getHospital(
            Long hospitalId) {

        Hospital hospital =
                hospitalRepository
                        .findByIdAndStatusAndDeletedAtIsNull(
                                hospitalId,
                                HospitalStatus.ACTIVE
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Hospital not found"
                                )
                        );

        PublicHospitalResponse response =
                publicHospitalMapper.toResponse(hospital);

        return ApiResponse
                .<PublicHospitalResponse>builder()
                .success(true)
                .message("Hospital fetched successfully")
                .data(response)
                .build();
    }
}