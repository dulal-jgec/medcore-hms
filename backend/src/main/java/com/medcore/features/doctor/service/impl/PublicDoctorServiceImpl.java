package com.medcore.features.doctor.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.RestPage;
import com.medcore.features.doctor.dto.response.PublicDoctorResponse;
import com.medcore.features.doctor.entity.Doctor;
import com.medcore.features.doctor.enums.DoctorStatus;
import com.medcore.features.doctor.mapper.DoctorMapper;
import com.medcore.features.doctor.repository.PublicDoctorRepository;
import com.medcore.features.doctor.service.PublicDoctorService;
import com.medcore.features.hospital.enums.HospitalStatus;
import com.medcore.features.hospital.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
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
public class PublicDoctorServiceImpl implements PublicDoctorService {

    private final PublicDoctorRepository doctorRepository;
    private final HospitalRepository hospitalRepository;
    private final DoctorMapper doctorMapper;

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("id", "experienceYears", "consultationFee", "createdAt");

    @Override
    @Cacheable(cacheNames = "publicDoctorList", key = "#p0 + ':page=' + #p1 + ':size=' + #p2 + ':sort=' + #p3 + ':dir=' + #p4.trim().toLowerCase()", unless = "#result == null || #result.data == null")
    public ApiResponse<RestPage<PublicDoctorResponse>> getDoctors(Long hospitalId, int page, int size, String sortBy, String sortDir) {
        validatePagination(page, size, sortBy, sortDir);

        hospitalRepository.findByIdAndStatusAndDeletedAtIsNull(hospitalId, HospitalStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found"));

        Sort sort = sortDir.trim().equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Doctor> doctorPage = doctorRepository.findByHospitalIdAndStatusAndDeletedAtIsNull(hospitalId, DoctorStatus.ACTIVE, pageable);
        Page<PublicDoctorResponse> responsePage = doctorPage.map(doctorMapper::toPublicResponse);

        return ApiResponse.<RestPage<PublicDoctorResponse>>builder()
                .success(true)
                .message("Doctors fetched successfully")
                .data(new RestPage<>(responsePage))
                .build();
    }

    @Override
    @Cacheable(cacheNames = "publicDoctorById", key = "#p0 + ':doctorId=' + #p1", unless = "#result == null || #result.data == null")
    public ApiResponse<PublicDoctorResponse> getDoctor(Long hospitalId, Long doctorId) {
        hospitalRepository.findByIdAndStatusAndDeletedAtIsNull(hospitalId, HospitalStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found"));

        Doctor doctor = doctorRepository.findByIdAndHospitalIdAndStatusAndDeletedAtIsNull(doctorId, hospitalId, DoctorStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        return ApiResponse.<PublicDoctorResponse>builder()
                .success(true)
                .message("Doctor fetched successfully")
                .data(doctorMapper.toPublicResponse(doctor))
                .build();
    }

    private void validatePagination(int page, int size, String sortBy, String sortDir) {
        if (page < 0) throw new BusinessException("Page must be greater than or equal to 0");
        if (size < 1 || size > 100) throw new BusinessException("Page size must be between 1 and 100");
        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) throw new BusinessException("Invalid sort field: " + sortBy);
        if (sortDir == null) throw new BusinessException("Sort direction is required");

        String normalizedSortDir = sortDir.trim().toLowerCase();
        if (!normalizedSortDir.equals("asc") && !normalizedSortDir.equals("desc")) {
            throw new BusinessException("Sort direction must be 'asc' or 'desc'");
        }
    }
}