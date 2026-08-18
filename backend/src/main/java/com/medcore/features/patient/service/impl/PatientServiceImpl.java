package com.medcore.features.patient.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.DuplicateResourceException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.PageResponse;
import com.medcore.common.security.TenantContextService;

import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.repository.HospitalRepository;

import com.medcore.features.patient.dto.request.CreatePatientRequest;
import com.medcore.features.patient.dto.request.UpdatePatientRequest;
import com.medcore.features.patient.dto.request.UpdatePatientStatusRequest;
import com.medcore.features.patient.dto.response.PatientResponse;
import com.medcore.features.patient.entity.Patient;
import com.medcore.features.patient.mapper.PatientMapper;
import com.medcore.features.patient.repository.PatientRepository;
import com.medcore.features.patient.service.PatientService;

import com.medcore.features.user.entity.User;
import com.medcore.features.user.enums.RoleName;
import com.medcore.features.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PatientServiceImpl
        implements PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final PatientMapper patientMapper;
    private final TenantContextService tenantContextService;

    private static final int MAX_PAGE_SIZE = 50;

    private static final Set<String> ALLOWED_SORT_FIELDS =
            Set.of(
                    "id",
                    "createdAt",
                    "updatedAt"
            );

    @Override
    public ApiResponse<PatientResponse> createPatient(
            CreatePatientRequest request) {

        Long hospitalId =
                getCurrentHospitalId();

        User user =
                userRepository
                        .findById(request.getUserId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found"
                                ));

        if (user.getRole() == null
                || user.getRole().getName()
                != RoleName.PATIENT) {

            throw new BusinessException(
                    "Selected user is not assigned the PATIENT role"
            );
        }

        if (user.getHospital() == null
                || !user.getHospital()
                .getId()
                .equals(hospitalId)) {

            throw new BusinessException(
                    "User does not belong to the current hospital"
            );
        }

      
        if (patientRepository.existsByUserIdAndHospitalId(
                user.getId(),
                hospitalId)) {

            throw new DuplicateResourceException(
                    "Patient profile already exists for this user"
            );
        }

        Hospital hospital =
                hospitalRepository
                        .findByIdAndDeletedAtIsNull(
                                hospitalId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Hospital not found"
                                ));

        Patient patient =
                patientMapper.toEntity(
                        request,
                        user,
                        hospital
                );

        Patient savedPatient =
                patientRepository.save(patient);

        return ApiResponse.<PatientResponse>builder()
                .success(true)
                .message("Patient created successfully")
                .data(
                        patientMapper.toResponse(
                                savedPatient
                        )
                )
                .build();
    }

    @Override
    public ApiResponse<PageResponse<PatientResponse>>
    getAllPatients(
            int page,
            int size,
            String sortBy,
            String sortDir) {

        Long hospitalId =
                getCurrentHospitalId();

        Pageable pageable =
                createPageable(
                        page,
                        size,
                        sortBy,
                        sortDir
                );

        Page<Patient> patientPage =
                patientRepository
                        .findByHospitalIdAndDeletedAtIsNull(
                                hospitalId,
                                pageable
                        );

        return buildPageResponse(
                patientPage,
                "Patients fetched successfully"
        );
    }

    @Override
    public ApiResponse<PatientResponse> getPatientById(
            Long patientId) {

        Long hospitalId =
                getCurrentHospitalId();

        Patient patient =
                patientRepository
                        .findByIdAndHospitalIdAndDeletedAtIsNull(
                                patientId,
                                hospitalId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Patient not found"
                                ));

        return ApiResponse.<PatientResponse>builder()
                .success(true)
                .message("Patient fetched successfully")
                .data(
                        patientMapper.toResponse(
                                patient
                        )
                )
                .build();
    }

    @Override
    public ApiResponse<PatientResponse> updatePatient(
            Long patientId,
            UpdatePatientRequest request) {

        Long hospitalId =
                getCurrentHospitalId();

        Patient patient =
                patientRepository
                        .findByIdAndHospitalIdAndDeletedAtIsNull(
                                patientId,
                                hospitalId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Patient not found"
                                ));

        patientMapper.updateEntity(
                patient,
                request
        );

        Patient updatedPatient =
                patientRepository.save(
                        patient
                );

        return ApiResponse.<PatientResponse>builder()
                .success(true)
                .message("Patient updated successfully")
                .data(
                        patientMapper.toResponse(
                                updatedPatient
                        )
                )
                .build();
    }

    @Override
    public ApiResponse<PatientResponse> updatePatientStatus(
            Long patientId,
            UpdatePatientStatusRequest request) {

        Long hospitalId =
                getCurrentHospitalId();

        Patient patient =
                patientRepository
                        .findByIdAndHospitalIdAndDeletedAtIsNull(
                                patientId,
                                hospitalId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Patient not found"
                                ));

        if (request.getStatus() == null) {

            throw new BusinessException(
                    "Patient status is required"
            );
        }

        patient.setStatus(
                request.getStatus()
        );

        Patient updatedPatient =
                patientRepository.save(
                        patient
                );

        return ApiResponse.<PatientResponse>builder()
                .success(true)
                .message("Patient status updated successfully")
                .data(
                        patientMapper.toResponse(
                                updatedPatient
                        )
                )
                .build();
    }

    @Override
    public ApiResponse<PageResponse<PatientResponse>>
    searchPatients(
            String keyword,
            int page,
            int size) {

        Long hospitalId =
                getCurrentHospitalId();

        if (keyword == null
                || keyword.trim().isEmpty()) {

            throw new BusinessException(
                    "Search keyword is required"
            );
        }

        Pageable pageable =
                PageRequest.of(
                        validatePage(page),
                        validateSize(size)
                );

        Page<Patient> patientPage =
                patientRepository
                        .findByHospitalIdAndUserFullNameContainingIgnoreCaseAndDeletedAtIsNull(
                                hospitalId,
                                keyword.trim(),
                                pageable
                        );

        return buildPageResponse(
                patientPage,
                "Patients fetched successfully"
        );
    }

    @Override
    public ApiResponse<String> deletePatient(
            Long patientId) {

        Long hospitalId =
                getCurrentHospitalId();

        Patient patient =
                patientRepository
                        .findByIdAndHospitalIdAndDeletedAtIsNull(
                                patientId,
                                hospitalId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Patient not found"
                                ));

        patient.setDeletedAt(
                LocalDateTime.now()
        );

        patientRepository.save(patient);

        return ApiResponse.<String>builder()
                .success(true)
                .message("Patient deleted successfully")
                .data("Deleted")
                .build();
    }

    @Override
    public ApiResponse<String> restorePatient(
            Long patientId) {

        Long hospitalId =
                getCurrentHospitalId();

        Patient patient =
                patientRepository
                        .findByIdAndHospitalId(
                                patientId,
                                hospitalId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Patient not found"
                                ));

        if (patient.getDeletedAt() == null) {

            throw new BusinessException(
                    "Patient is already active"
            );
        }

        patient.setDeletedAt(null);

        patientRepository.save(patient);

        return ApiResponse.<String>builder()
                .success(true)
                .message("Patient restored successfully")
                .data("Restored")
                .build();
    }

    private Long getCurrentHospitalId() {

        Long hospitalId =
                tenantContextService
                        .getCurrentHospitalId();

        if (hospitalId == null) {

            throw new BusinessException(
                    "User is not associated with a hospital"
            );
        }

        return hospitalId;
    }

    private Pageable createPageable(
            int page,
            int size,
            String sortBy,
            String sortDir) {

        int validPage =
                validatePage(page);

        int validSize =
                validateSize(size);

        String validSortBy =
                validateSortField(sortBy);

        Sort sort =
                "desc".equalsIgnoreCase(sortDir)
                        ? Sort.by(validSortBy).descending()
                        : Sort.by(validSortBy).ascending();

        return PageRequest.of(
                validPage,
                validSize,
                sort
        );
    }

    private int validatePage(int page) {

        if (page < 0) {

            throw new BusinessException(
                    "Page number cannot be negative"
            );
        }

        return page;
    }

    private int validateSize(int size) {

        if (size <= 0) {

            throw new BusinessException(
                    "Page size must be greater than zero"
            );
        }

        if (size > MAX_PAGE_SIZE) {

            throw new BusinessException(
                    "Page size cannot exceed "
                            + MAX_PAGE_SIZE
            );
        }

        return size;
    }

    private String validateSortField(
            String sortBy) {

        if (sortBy == null
                || !ALLOWED_SORT_FIELDS
                .contains(sortBy)) {

            throw new BusinessException(
                    "Invalid sort field"
            );
        }

        return sortBy;
    }

    private ApiResponse<PageResponse<PatientResponse>>
    buildPageResponse(
            Page<Patient> patientPage,
            String message) {

        List<PatientResponse> items =
                patientPage
                        .getContent()
                        .stream()
                        .map(patientMapper::toResponse)
                        .toList();

        PageResponse<PatientResponse> response =
                PageResponse
                        .<PatientResponse>builder()
                        .items(items)
                        .page(patientPage.getNumber())
                        .size(patientPage.getSize())
                        .totalElements(
                                patientPage.getTotalElements()
                        )
                        .totalPages(
                                patientPage.getTotalPages()
                        )
                        .first(
                                patientPage.isFirst()
                        )
                        .last(
                                patientPage.isLast()
                        )
                        .hasNext(
                                patientPage.hasNext()
                        )
                        .hasPrevious(
                                patientPage.hasPrevious()
                        )
                        .build();

        return ApiResponse
                .<PageResponse<PatientResponse>>builder()
                .success(true)
                .message(message)
                .data(response)
                .build();
    }
}