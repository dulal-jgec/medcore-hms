package com.medcore.features.patient.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.DuplicateResourceException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.PageResponse;
import com.medcore.common.security.TenantContextService;
import com.medcore.features.patient.dto.request.CreatePatientMeRequest;
import com.medcore.features.patient.dto.request.CreatePatientRequest;
import com.medcore.features.patient.dto.request.UpdatePatientRequest;
import com.medcore.features.patient.dto.request.UpdatePatientStatusRequest;
import com.medcore.features.patient.dto.response.PatientResponse;
import com.medcore.features.patient.entity.Patient;
import com.medcore.features.patient.enums.PatientStatus;
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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;

    private final UserRepository userRepository;

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
    @Transactional
    public ApiResponse<PatientResponse> createPatient(
            CreatePatientRequest request) {

        User user = userRepository
                .findById(request.getUserId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        ));

        if (user.getRole() == null
                || user.getRole().getName() != RoleName.PATIENT) {

            throw new BusinessException(
                    "Selected user is not assigned the PATIENT role"
            );
        }

        if (patientRepository.existsByUserId(user.getId())) {

            throw new DuplicateResourceException(
                    "Patient profile already exists for this user"
            );
        }

        Patient patient =
                patientMapper.toEntity(
                        request,
                        user
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

    /*
     * ---------------------------------------------------------
     * HOSPITAL-SCOPED OPERATIONS
     * ---------------------------------------------------------
     *
     * These methods must NOT use Patient.hospital anymore.
     *
     * They will be changed to use:
     *
     * Appointment -> Hospital
     * Appointment -> Patient
     *
     * so tenant isolation remains intact.
     */

    @Override
    public ApiResponse<PageResponse<PatientResponse>> getAllPatients(
            int page,
            int size,
            String sortBy,
            String sortDir) {

        throw new BusinessException(
                "Hospital-scoped patient listing will be implemented through appointments"
        );
    }

    @Override
    public ApiResponse<PatientResponse> getPatientById(
            Long patientId) {

        Patient patient =
                patientRepository
                        .findByIdAndDeletedAtIsNull(patientId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Patient not found"
                                ));

        return ApiResponse.<PatientResponse>builder()
                .success(true)
                .message("Patient fetched successfully")
                .data(
                        patientMapper.toResponse(patient)
                )
                .build();
    }

    @Override
    public ApiResponse<PatientResponse> updatePatient(
            Long patientId,
            UpdatePatientRequest request) {

        Patient patient =
                patientRepository
                        .findByIdAndDeletedAtIsNull(patientId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Patient not found"
                                ));

        patientMapper.updateEntity(
                patient,
                request
        );

        Patient updatedPatient =
                patientRepository.save(patient);

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

        Patient patient =
                patientRepository
                        .findByIdAndDeletedAtIsNull(patientId)
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
                patientRepository.save(patient);

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
    public ApiResponse<PageResponse<PatientResponse>> searchPatients(
            String keyword,
            int page,
            int size) {

        /*
         * This will later search patients through
         * Appointment -> Hospital -> Patient.
         */

        throw new BusinessException(
                "Hospital-scoped patient search will be implemented through appointments"
        );
    }

    @Override
    public ApiResponse<String> deletePatient(
            Long patientId) {

        Patient patient =
                patientRepository
                        .findByIdAndDeletedAtIsNull(patientId)
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

        Patient patient =
                patientRepository
                        .findById(patientId)
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

    @Override
    @Transactional
    public ApiResponse<PatientResponse> createMyProfile(
            CreatePatientMeRequest request) {

        User user = getCurrentUser();

        if (user.getRole() == null
                || user.getRole().getName() != RoleName.PATIENT) {

            throw new BusinessException(
                    "Only patients can create a patient profile"
            );
        }

        if (patientRepository.existsByUserId(user.getId())) {

            throw new DuplicateResourceException(
                    "Patient profile already exists"
            );
        }

        Patient patient = Patient.builder()
                .user(user)
                .dateOfBirth(request.getDateOfBirth())
                .bloodGroup(request.getBloodGroup())
                .emergencyContactName(
                        request.getEmergencyContactName().trim()
                )
                .emergencyContactPhone(
                        request.getEmergencyContactPhone().trim()
                )
                .emergencyContactRelation(
                        request.getEmergencyContactRelation().trim()
                )
                .allergies(request.getAllergies())
                .chronicConditions(request.getChronicConditions())
                .status(PatientStatus.ACTIVE)
                .build();

        Patient savedPatient =
                patientRepository.save(patient);

        return ApiResponse.<PatientResponse>builder()
                .success(true)
                .message("Patient profile created successfully")
                .data(
                        patientMapper.toResponse(
                                savedPatient
                        )
                )
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PatientResponse> getMyProfile() {

        User user = getCurrentUser();

        Patient patient =
                patientRepository
                        .findByUserIdAndDeletedAtIsNull(
                                user.getId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Patient profile not found"
                                ));

        return ApiResponse.<PatientResponse>builder()
                .success(true)
                .message("Patient profile fetched successfully")
                .data(
                        patientMapper.toResponse(
                                patient
                        )
                )
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<PatientResponse> updateMyProfile(
            UpdatePatientRequest request) {

        User user = getCurrentUser();

        Patient patient =
                patientRepository
                        .findByUserIdAndDeletedAtIsNull(
                                user.getId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Patient profile not found"
                                ));

        patientMapper.updateEntity(
                patient,
                request
        );

        Patient updatedPatient =
                patientRepository.save(patient);

        return ApiResponse.<PatientResponse>builder()
                .success(true)
                .message("Patient profile updated successfully")
                .data(
                        patientMapper.toResponse(
                                updatedPatient
                        )
                )
                .build();
    }

    private Pageable createPageable(
            int page,
            int size,
            String sortBy,
            String sortDir) {

        int validPage = validatePage(page);

        int validSize = validateSize(size);

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
                || !ALLOWED_SORT_FIELDS.contains(sortBy)) {

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
                        .first(patientPage.isFirst())
                        .last(patientPage.isLast())
                        .hasNext(patientPage.hasNext())
                        .hasPrevious(patientPage.hasPrevious())
                        .build();

        return ApiResponse
                .<PageResponse<PatientResponse>>builder()
                .success(true)
                .message(message)
                .data(response)
                .build();
    }

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new BusinessException(
                    "User is not authenticated"
            );
        }

        String email =
                authentication.getName();

        return userRepository
                .findByEmailWithRole(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Current user not found"
                        ));
    }
}