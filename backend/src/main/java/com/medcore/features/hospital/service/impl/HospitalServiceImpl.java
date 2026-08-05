package com.medcore.features.hospital.service.impl;

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

@Service
@RequiredArgsConstructor
public class HospitalServiceImpl implements HospitalService {

    private final HospitalRepository hospitalRepository;
    private final HospitalMapper hospitalMapper;

    @Override
    public ApiResponse<CreateHospitalResponse> createHospital(CreateHospitalRequest request) {

        if (hospitalRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Hospital email already exists");
        }

        if (hospitalRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new DuplicateResourceException("License number already exists");
        }

        Hospital hospital = hospitalMapper.toEntity(request);

        Hospital savedHospital = hospitalRepository.save(hospital);

        CreateHospitalResponse response = hospitalMapper.toResponse(savedHospital);

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

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Hospital> hospitalPage = hospitalRepository.findAll(pageable);

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

        Hospital hospital = hospitalRepository.findById(hospitalId)
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

        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Hospital not found with id : " + hospitalId));

        if (!hospital.getEmail().equalsIgnoreCase(request.getEmail())
                && hospitalRepository.existsByEmail(request.getEmail())) {

            throw new DuplicateResourceException("Hospital email already exists");
        }

        if (!hospital.getLicenseNumber().equalsIgnoreCase(request.getLicenseNumber())
                && hospitalRepository.existsByLicenseNumber(request.getLicenseNumber())) {

            throw new DuplicateResourceException("License number already exists");
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

        Hospital hospital = hospitalRepository.findById(hospitalId)
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

        Pageable pageable = PageRequest.of(page, size);

        Page<Hospital> hospitals =
                hospitalRepository.findByNameContainingIgnoreCaseOrCityContainingIgnoreCase(
                        keyword,
                        keyword,
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
}