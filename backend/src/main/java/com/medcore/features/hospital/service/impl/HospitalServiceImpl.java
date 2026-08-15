package com.medcore.features.hospital.service.impl;

import com.medcore.common.exception.BusinessException;
import org.springframework.transaction.annotation.Transactional;
import com.medcore.common.exception.DuplicateResourceException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.features.hospital.dto.request.CreateHospitalRequest;
import com.medcore.features.hospital.dto.request.UpdateHospitalRequest;
import com.medcore.features.hospital.dto.request.UpdateHospitalStatusRequest;
import com.medcore.features.hospital.dto.response.CreateHospitalResponse;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.mapper.HospitalMapper;
import com.medcore.features.hospital.repository.HospitalRepository;
import com.medcore.features.hospital.service.HospitalService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import java.time.LocalDateTime;
import java.util.Set;
@Service
@RequiredArgsConstructor
@Transactional
public class HospitalServiceImpl implements HospitalService {

    private final HospitalRepository hospitalRepository;
    private final HospitalMapper hospitalMapper;
    private static final Set<String> ALLOWED_SORT_FIELDS =
            Set.of("id", "name", "email", "city", "createdAt", "updatedAt");

  @Override
public ApiResponse<CreateHospitalResponse> createHospital(
        CreateHospitalRequest request) {

    String email = request.getEmail().trim().toLowerCase();
    String licenseNumber = request.getLicenseNumber().trim();
    String phone = request.getPhone().trim();
    
    
    

    if (hospitalRepository.existsByEmailAndDeletedAtIsNull(email)) {
        throw new DuplicateResourceException(
                "Hospital email already exists"
        );
    }

    if (hospitalRepository.existsByLicenseNumberAndDeletedAtIsNull(licenseNumber)) {
        throw new DuplicateResourceException(
                "License number already exists"
        );
    }

    if (hospitalRepository.existsByPhoneAndDeletedAtIsNull(phone)) {
        throw new DuplicateResourceException(
                "Hospital phone number already exists"
        );
    }

    Hospital hospital = hospitalMapper.toEntity(request);

    // Important: save normalized values
    hospital.setEmail(email);
    hospital.setLicenseNumber(licenseNumber);
    hospital.setPhone(phone);

    Hospital savedHospital = hospitalRepository.save(hospital);

    CreateHospitalResponse response =
            hospitalMapper.toResponse(savedHospital);

    return ApiResponse.<CreateHospitalResponse>builder()
            .success(true)
            .message("Hospital created successfully")
            .data(response)
            .build();
}
    
    @Override
    public ApiResponse<Page<CreateHospitalResponse>> getAllHospitals(
            int page,
            int size,
            String sortBy,
            String sortDir) {
    	
    	if (page < 0) {
    	    throw new BusinessException("Page must be greater than or equal to 0");
    	}

    	if (size < 1 || size > 100) {
    	    throw new BusinessException("Page size must be between 1 and 100");
    	}
    	
    	if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
    	    throw new BusinessException(
    	            "Invalid sort field: " + sortBy
    	    );
    	}
    	
    	sortDir = sortDir.trim().toLowerCase();

    	if (!sortDir.equals("asc") && !sortDir.equals("desc")) {
    	    throw new BusinessException(
    	            "Sort direction must be 'asc' or 'desc'"
    	    );
    	}

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Hospital> hospitalPage = hospitalRepository.findByDeletedAtIsNull(pageable);

        Page<CreateHospitalResponse> responsePage =
                hospitalPage.map(hospitalMapper::toResponse);

        return ApiResponse.<Page<CreateHospitalResponse>>builder()
                .success(true)
                .message("Hospitals fetched successfully")
                .data(responsePage)
                .build();
    }
    
    @Override
    public ApiResponse<CreateHospitalResponse> getHospitalById(Long hospitalId) {

        Hospital hospital = hospitalRepository.findByIdAndDeletedAtIsNull(hospitalId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Hospital not found with id : " + hospitalId));

        CreateHospitalResponse response = hospitalMapper.toResponse(hospital);

        return ApiResponse.<CreateHospitalResponse>builder()
                .success(true)
                .message("Hospital fetched successfully")
                .data(response)
                .build();
    }
    
    @Override
    public ApiResponse<CreateHospitalResponse> updateHospital(
            Long hospitalId,
            UpdateHospitalRequest request) {

    	Hospital hospital = hospitalRepository.findByIdAndDeletedAtIsNull(hospitalId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Hospital not found with id : " + hospitalId));

    	String email = request.getEmail().trim().toLowerCase();
    	String licenseNumber = request.getLicenseNumber().trim();
    	String phone = request.getPhone().trim();

    	if (!hospital.getEmail().equalsIgnoreCase(email)
    	        && hospitalRepository.existsByEmailAndDeletedAtIsNull(email)) {

    	    throw new DuplicateResourceException(
    	            "Hospital email already exists"
    	    );
    	}

    	if (!hospital.getLicenseNumber().equalsIgnoreCase(licenseNumber)
    	        && hospitalRepository.existsByLicenseNumberAndDeletedAtIsNull(licenseNumber)) {

    	    throw new DuplicateResourceException(
    	            "License number already exists"
    	    );
    	}

    	if (!hospital.getPhone().equals(phone)
    	        && hospitalRepository.existsByPhoneAndDeletedAtIsNull(phone)) {

    	    throw new DuplicateResourceException(
    	            "Hospital phone number already exists"
    	    );
    	}

        hospitalMapper.updateEntity(hospital, request);

        Hospital updatedHospital = hospitalRepository.save(hospital);

        CreateHospitalResponse response =
                hospitalMapper.toResponse(updatedHospital);

        return ApiResponse.<CreateHospitalResponse>builder()
                .success(true)
                .message("Hospital updated successfully")
                .data(response)
                .build();
    }
    
    @Override
    public ApiResponse<CreateHospitalResponse> updateHospitalStatus(
            Long hospitalId,
            UpdateHospitalStatusRequest request) {

    	Hospital hospital = hospitalRepository
    	        .findByIdAndDeletedAtIsNull(hospitalId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Hospital not found with id : " + hospitalId));

        hospital.setStatus(request.getStatus());

        Hospital updatedHospital = hospitalRepository.save(hospital);

        CreateHospitalResponse response =
                hospitalMapper.toResponse(updatedHospital);

        return ApiResponse.<CreateHospitalResponse>builder()
                .success(true)
                .message("Hospital status updated successfully")
                .data(response)
                .build();
    }
    
@Override
public ApiResponse<Page<CreateHospitalResponse>> searchHospitals(
        String keyword,
        int page,
        int size) {

    if (keyword == null || keyword.trim().isEmpty()) {
        throw new BusinessException(
                "Search keyword cannot be empty"
        );
    }

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

    String normalizedKeyword = keyword.trim();

    Pageable pageable = PageRequest.of(page, size);

    Page<Hospital> hospitals =
            hospitalRepository.searchHospitals(
                    normalizedKeyword,
                    pageable
            );

    Page<CreateHospitalResponse> response =
            hospitals.map(hospitalMapper::toResponse);

    return ApiResponse.<Page<CreateHospitalResponse>>builder()
            .success(true)
            .message("Hospitals fetched successfully")
            .data(response)
            .build();
}
    
    @Override
    public ApiResponse<String> deleteHospital(Long hospitalId) {

        Hospital hospital = hospitalRepository
                .findByIdAndDeletedAtIsNull(hospitalId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Hospital not found"));

        hospital.setDeletedAt(LocalDateTime.now());

        hospitalRepository.save(hospital);

        return ApiResponse.<String>builder()
                .success(true)
                .message("Hospital deleted successfully")
                .data("Deleted")
                .build();
    }
    
    @Override
    public ApiResponse<String> restoreHospital(Long hospitalId) {

        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Hospital not found"));

        if (hospital.getDeletedAt() == null) {
        	throw new BusinessException(
        	        "Hospital is not deleted"
        	);
        }

        hospital.setDeletedAt(null);

        hospitalRepository.save(hospital);

        return ApiResponse.<String>builder()
                .success(true)
                .message("Hospital restored successfully")
                .data("Restored")
                .build();
    }
}