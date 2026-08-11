package com.medcore.features.patient.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.DuplicateResourceException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.PageResponse;
import com.medcore.common.security.SecurityUtil;
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
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final PatientMapper patientMapper;

    @Override
    public ApiResponse<PatientResponse> createPatient(
            CreatePatientRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        Hospital hospital = hospitalRepository
                .findByIdAndDeletedAtIsNull(request.getHospitalId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Hospital not found"));

        if (patientRepository.existsByUserId(user.getId())) {
            throw new DuplicateResourceException(
                    "Patient profile already exists for this user");
        }

        if (user.getRole().getName() != RoleName.PATIENT) {
            throw new BusinessException(
                    "Selected user is not assigned the PATIENT role");
        }

        if (!user.getHospital().getId().equals(hospital.getId())) {
            throw new BusinessException(
                    "User does not belong to the selected hospital");
        }

        Patient patient =
                patientMapper.toEntity(request, user, hospital);

        Patient savedPatient =
                patientRepository.save(patient);

        return ApiResponse.<PatientResponse>builder()
                .success(true)
                .message("Patient created successfully")
                .data(patientMapper.toResponse(savedPatient))
                .build();
    }
    
    @Override
    public ApiResponse<PageResponse<PatientResponse>> getAllPatients(
            int page,
            int size,
            String sortBy,
            String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Patient> patientPage =
                patientRepository.findByDeletedAtIsNull(pageable);

        List<PatientResponse> items = patientPage.getContent()
                .stream()
                .map(patientMapper::toResponse)
                .toList();

        PageResponse<PatientResponse> response =
                PageResponse.<PatientResponse>builder()
                        .items(items)
                        .page(patientPage.getNumber())
                        .size(patientPage.getSize())
                        .totalElements(patientPage.getTotalElements())
                        .totalPages(patientPage.getTotalPages())
                        .first(patientPage.isFirst())
                        .last(patientPage.isLast())
                        .hasNext(patientPage.hasNext())
                        .hasPrevious(patientPage.hasPrevious())
                        .build();

        return ApiResponse.<PageResponse<PatientResponse>>builder()
                .success(true)
                .message("Patients fetched successfully")
                .data(response)
                .build();
    }
    
    @Override
    public ApiResponse<PatientResponse> getPatientById(Long patientId) {

        Patient patient = patientRepository
                .findByIdAndDeletedAtIsNull(patientId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Patient not found"));

        return ApiResponse.<PatientResponse>builder()
                .success(true)
                .message("Patient fetched successfully")
                .data(patientMapper.toResponse(patient))
                .build();
    }
    
    @Override
    public ApiResponse<PatientResponse> updatePatient(
            Long patientId,
            UpdatePatientRequest request) {

        Patient patient = patientRepository
                .findByIdAndDeletedAtIsNull(patientId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Patient not found"));

        patientMapper.updateEntity(patient, request);

        Patient updatedPatient = patientRepository.save(patient);

        return ApiResponse.<PatientResponse>builder()
                .success(true)
                .message("Patient updated successfully")
                .data(patientMapper.toResponse(updatedPatient))
                .build();
    }
    
    @Override
    public ApiResponse<PatientResponse> updatePatientStatus(
            Long patientId,
            UpdatePatientStatusRequest request) {

        Patient patient = patientRepository
                .findByIdAndDeletedAtIsNull(patientId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Patient not found"));

        patient.setStatus(request.getStatus());

        Patient updatedPatient = patientRepository.save(patient);

        return ApiResponse.<PatientResponse>builder()
                .success(true)
                .message("Patient status updated successfully")
                .data(patientMapper.toResponse(updatedPatient))
                .build();
    }
    
@Override
public ApiResponse<PageResponse<PatientResponse>> searchPatients(
        String keyword,
        int page,
        int size) {

    User currentUser = getCurrentUser();

    if (currentUser.getHospital() == null) {

        throw new BusinessException(
                "User is not associated with any hospital"
        );
    }

    Long hospitalId =
            currentUser.getHospital().getId();

    Pageable pageable =
            PageRequest.of(page, size);

    Page<Patient> patientPage =
            patientRepository
                    .findByHospitalIdAndUserFullNameContainingIgnoreCaseAndDeletedAtIsNull(
                            hospitalId,
                            keyword,
                            pageable
                    );

    List<PatientResponse> items =
            patientPage.getContent()
                    .stream()
                    .map(patientMapper::toResponse)
                    .toList();

    PageResponse<PatientResponse> response =
            PageResponse.<PatientResponse>builder()
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
            .message("Patients fetched successfully")
            .data(response)
            .build();
    
    
}
    
    @Override
    public ApiResponse<String> deletePatient(Long patientId) {

        Patient patient = patientRepository
                .findByIdAndDeletedAtIsNull(patientId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Patient not found"));

        patient.setDeletedAt(LocalDateTime.now());

        patientRepository.save(patient);

        return ApiResponse.<String>builder()
                .success(true)
                .message("Patient deleted successfully")
                .data("Deleted")
                .build();
    }
    
    @Override
    public ApiResponse<String> restorePatient(Long patientId) {

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Patient not found"));

        if (patient.getDeletedAt() == null) {
            throw new BusinessException(
                    "Patient is already active");
        }

        patient.setDeletedAt(null);

        patientRepository.save(patient);

        return ApiResponse.<String>builder()
                .success(true)
                .message("Patient restored successfully")
                .data("Restored")
                .build();
    }
    
    private User getCurrentUser() {

        String email = SecurityUtil.getCurrentUsername();

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Current user not found"
                        ));
    }
}