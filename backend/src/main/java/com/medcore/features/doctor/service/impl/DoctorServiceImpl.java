package com.medcore.features.doctor.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.DuplicateResourceException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.PageResponse;
import com.medcore.features.department.entity.Department;
import com.medcore.features.department.repository.DepartmentRepository;
import com.medcore.features.doctor.dto.request.CreateDoctorRequest;
import com.medcore.features.doctor.dto.request.UpdateDoctorRequest;
import com.medcore.features.doctor.dto.request.UpdateDoctorStatusRequest;
import com.medcore.features.doctor.dto.response.DoctorResponse;
import com.medcore.features.doctor.entity.Doctor;
import com.medcore.features.doctor.mapper.DoctorMapper;
import com.medcore.features.doctor.repository.DoctorRepository;
import com.medcore.features.doctor.service.DoctorService;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.repository.HospitalRepository;
import com.medcore.features.user.entity.User;
import com.medcore.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import com.medcore.features.user.enums.RoleName;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final DepartmentRepository departmentRepository;
    private final DoctorMapper doctorMapper;

    @Override
    public ApiResponse<DoctorResponse> createDoctor(CreateDoctorRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));
        if (user.getRole().getName() != RoleName.DOCTOR) {
            throw new BusinessException(
                    "Selected user is not assigned the DOCTOR role");
        }
        
        Hospital hospital = hospitalRepository
                .findByIdAndDeletedAtIsNull(request.getHospitalId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Hospital not found"));

        Department department = departmentRepository
                .findByIdAndDeletedAtIsNull(request.getDepartmentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Department not found"));
        
        if (!department.getHospital().getId().equals(hospital.getId())) {
            throw new BusinessException(
                "Department does not belong to the selected hospital"
            );
        }
        
        if (!user.getHospital().getId().equals(hospital.getId())) {
            throw new BusinessException(
                    "User does not belong to the selected hospital");
        }
        
        if (doctorRepository.existsByUserId(user.getId())) {
            throw new DuplicateResourceException(
                    "Doctor profile already exists for this user");
        }

        Doctor doctor = doctorMapper.toEntity(
                request,
                user,
                hospital,
                department
        );

        Doctor savedDoctor = doctorRepository.save(doctor);

        return ApiResponse.<DoctorResponse>builder()
                .success(true)
                .message("Doctor created successfully")
                .data(doctorMapper.toResponse(savedDoctor))
                .build();
    }
    
    @Override
    public ApiResponse<PageResponse<DoctorResponse>> getAllDoctors(
            int page,
            int size,
            String sortBy,
            String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Doctor> doctorPage =
                doctorRepository.findByDeletedAtIsNull(pageable);

        List<DoctorResponse> items = doctorPage.getContent()
                .stream()
                .map(doctorMapper::toResponse)
                .toList();

        PageResponse<DoctorResponse> response =
                PageResponse.<DoctorResponse>builder()
                        .items(items)
                        .page(doctorPage.getNumber())
                        .size(doctorPage.getSize())
                        .totalElements(doctorPage.getTotalElements())
                        .totalPages(doctorPage.getTotalPages())
                        .first(doctorPage.isFirst())
                        .last(doctorPage.isLast())
                        .hasNext(doctorPage.hasNext())
                        .hasPrevious(doctorPage.hasPrevious())
                        .build();

        return ApiResponse.<PageResponse<DoctorResponse>>builder()
                .success(true)
                .message("Doctors fetched successfully")
                .data(response)
                .build();
    }
    
    @Override
    public ApiResponse<DoctorResponse> getDoctorById(Long doctorId) {

        Doctor doctor = doctorRepository
                .findByIdAndDeletedAtIsNull(doctorId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Doctor not found"));

        return ApiResponse.<DoctorResponse>builder()
                .success(true)
                .message("Doctor fetched successfully")
                .data(doctorMapper.toResponse(doctor))
                .build();
    }
    
    @Override
    public ApiResponse<DoctorResponse> updateDoctor(
            Long doctorId,
            UpdateDoctorRequest request) {

        Doctor doctor = doctorRepository
                .findByIdAndDeletedAtIsNull(doctorId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Doctor not found"));

        doctorMapper.updateEntity(doctor, request);

        Doctor updatedDoctor = doctorRepository.save(doctor);

        return ApiResponse.<DoctorResponse>builder()
                .success(true)
                .message("Doctor updated successfully")
                .data(doctorMapper.toResponse(updatedDoctor))
                .build();
    }
    
    @Override
    public ApiResponse<DoctorResponse> updateDoctorStatus(
            Long doctorId,
            UpdateDoctorStatusRequest request) {

        Doctor doctor = doctorRepository
                .findByIdAndDeletedAtIsNull(doctorId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Doctor not found"));

        doctor.setStatus(request.getStatus());

        Doctor updatedDoctor = doctorRepository.save(doctor);

        return ApiResponse.<DoctorResponse>builder()
                .success(true)
                .message("Doctor status updated successfully")
                .data(doctorMapper.toResponse(updatedDoctor))
                .build();
    }
    
    @Override
    public ApiResponse<PageResponse<DoctorResponse>> searchDoctors(
            String keyword,
            int page,
            int size) {

        Pageable pageable = PageRequest.of(page, size);

        Page<Doctor> doctorPage =
                doctorRepository.findBySpecializationContainingIgnoreCaseAndDeletedAtIsNull(
                        keyword,
                        pageable
                );

        List<DoctorResponse> items = doctorPage.getContent()
                .stream()
                .map(doctorMapper::toResponse)
                .toList();

        PageResponse<DoctorResponse> response =
                PageResponse.<DoctorResponse>builder()
                        .items(items)
                        .page(doctorPage.getNumber())
                        .size(doctorPage.getSize())
                        .totalElements(doctorPage.getTotalElements())
                        .totalPages(doctorPage.getTotalPages())
                        .first(doctorPage.isFirst())
                        .last(doctorPage.isLast())
                        .hasNext(doctorPage.hasNext())
                        .hasPrevious(doctorPage.hasPrevious())
                        .build();

        return ApiResponse.<PageResponse<DoctorResponse>>builder()
                .success(true)
                .message("Doctors fetched successfully")
                .data(response)
                .build();
    }
    
    @Override
    public ApiResponse<String> deleteDoctor(Long doctorId) {

        Doctor doctor = doctorRepository
                .findByIdAndDeletedAtIsNull(doctorId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Doctor not found"));

        doctor.setDeletedAt(LocalDateTime.now());

        doctorRepository.save(doctor);

        return ApiResponse.<String>builder()
                .success(true)
                .message("Doctor deleted successfully")
                .data("Deleted")
                .build();
    }
    
    @Override
    public ApiResponse<String> restoreDoctor(Long doctorId) {

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Doctor not found"));

        if (doctor.getDeletedAt() == null) {
            throw new BusinessException("Doctor is already active");
        }

        doctor.setDeletedAt(null);

        doctorRepository.save(doctor);

        return ApiResponse.<String>builder()
                .success(true)
                .message("Doctor restored successfully")
                .data("Restored")
                .build();
    }
}