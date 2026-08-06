package com.medcore.features.department.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.DuplicateResourceException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.PageResponse;
import com.medcore.features.department.dto.request.CreateDepartmentRequest;
import com.medcore.features.department.dto.request.UpdateDepartmentRequest;
import com.medcore.features.department.dto.request.UpdateDepartmentStatusRequest;
import com.medcore.features.department.dto.response.DepartmentResponse;
import com.medcore.features.department.entity.Department;
import com.medcore.features.department.mapper.DepartmentMapper;
import com.medcore.features.department.repository.DepartmentRepository;
import com.medcore.features.department.service.DepartmentService;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final HospitalRepository hospitalRepository;
    private final DepartmentMapper departmentMapper;

    @Override
    public ApiResponse<DepartmentResponse> createDepartment(CreateDepartmentRequest request) {

        Hospital hospital = hospitalRepository
                .findByIdAndDeletedAtIsNull(request.getHospitalId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Hospital not found"));

        if (departmentRepository.existsByHospitalIdAndNameIgnoreCase(
                hospital.getId(),
                request.getName())) {

            throw new DuplicateResourceException(
                    "Department name already exists in this hospital");
        }

        if (departmentRepository.existsByHospitalIdAndCodeIgnoreCase(
                hospital.getId(),
                request.getCode())) {

            throw new DuplicateResourceException(
                    "Department code already exists in this hospital");
        }

        Department department =
                departmentMapper.toEntity(request, hospital);

        Department savedDepartment =
                departmentRepository.save(department);

        DepartmentResponse response =
                departmentMapper.toResponse(savedDepartment);

        return ApiResponse.<DepartmentResponse>builder()
                .success(true)
                .message("Department created successfully")
                .data(response)
                .build();
    }
    
    @Override
    public ApiResponse<PageResponse<DepartmentResponse>> getAllDepartments(
            int page,
            int size,
            String sortBy,
            String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Department> departmentPage =
                departmentRepository.findByDeletedAtIsNull(pageable);

        List<DepartmentResponse> items = departmentPage.getContent()
                .stream()
                .map(departmentMapper::toResponse)
                .toList();

        PageResponse<DepartmentResponse> response =
                PageResponse.<DepartmentResponse>builder()
                        .items(items)
                        .page(departmentPage.getNumber())
                        .size(departmentPage.getSize())
                        .totalElements(departmentPage.getTotalElements())
                        .totalPages(departmentPage.getTotalPages())
                        .first(departmentPage.isFirst())
                        .last(departmentPage.isLast())
                        .hasNext(departmentPage.hasNext())
                        .hasPrevious(departmentPage.hasPrevious())
                        .build();

        return ApiResponse.<PageResponse<DepartmentResponse>>builder()
                .success(true)
                .message("Departments fetched successfully")
                .data(response)
                .build();
    }
    
    @Override
    public ApiResponse<DepartmentResponse> getDepartmentById(Long departmentId) {

        Department department = departmentRepository
                .findByIdAndDeletedAtIsNull(departmentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Department not found"));

        return ApiResponse.<DepartmentResponse>builder()
                .success(true)
                .message("Department fetched successfully")
                .data(departmentMapper.toResponse(department))
                .build();
    }
    
    @Override
    public ApiResponse<DepartmentResponse> updateDepartment(
            Long departmentId,
            UpdateDepartmentRequest request) {

        Department department = departmentRepository
                .findByIdAndDeletedAtIsNull(departmentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Department not found"));

        Long hospitalId = department.getHospital().getId();

        if (!department.getName().equalsIgnoreCase(request.getName())
                && departmentRepository.existsByHospitalIdAndNameIgnoreCase(
                        hospitalId,
                        request.getName())) {

            throw new DuplicateResourceException(
                    "Department name already exists");
        }

        if (!department.getCode().equalsIgnoreCase(request.getCode())
                && departmentRepository.existsByHospitalIdAndCodeIgnoreCase(
                        hospitalId,
                        request.getCode())) {

            throw new DuplicateResourceException(
                    "Department code already exists");
        }

        departmentMapper.updateEntity(department, request);

        Department updatedDepartment = departmentRepository.save(department);

        return ApiResponse.<DepartmentResponse>builder()
                .success(true)
                .message("Department updated successfully")
                .data(departmentMapper.toResponse(updatedDepartment))
                .build();
    }
    
    @Override
    public ApiResponse<DepartmentResponse> updateDepartmentStatus(
            Long departmentId,
            UpdateDepartmentStatusRequest request) {

        Department department = departmentRepository
                .findByIdAndDeletedAtIsNull(departmentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Department not found"));

        department.setStatus(request.getStatus());

        Department updatedDepartment =
                departmentRepository.save(department);

        return ApiResponse.<DepartmentResponse>builder()
                .success(true)
                .message("Department status updated successfully")
                .data(departmentMapper.toResponse(updatedDepartment))
                .build();
    }
    
    @Override
    public ApiResponse<PageResponse<DepartmentResponse>> searchDepartments(
            String keyword,
            int page,
            int size) {

        Pageable pageable = PageRequest.of(page, size);

        Page<Department> departmentPage =
                departmentRepository
                        .findByNameContainingIgnoreCaseAndDeletedAtIsNull(
                                keyword,
                                pageable
                        );

        List<DepartmentResponse> items =
                departmentPage.getContent()
                        .stream()
                        .map(departmentMapper::toResponse)
                        .toList();

        PageResponse<DepartmentResponse> response =
                PageResponse.<DepartmentResponse>builder()
                        .items(items)
                        .page(departmentPage.getNumber())
                        .size(departmentPage.getSize())
                        .totalElements(departmentPage.getTotalElements())
                        .totalPages(departmentPage.getTotalPages())
                        .first(departmentPage.isFirst())
                        .last(departmentPage.isLast())
                        .hasNext(departmentPage.hasNext())
                        .hasPrevious(departmentPage.hasPrevious())
                        .build();

        return ApiResponse.<PageResponse<DepartmentResponse>>builder()
                .success(true)
                .message("Departments fetched successfully")
                .data(response)
                .build();
    }
    
    @Override
    public ApiResponse<String> deleteDepartment(Long departmentId) {

        Department department = departmentRepository
                .findByIdAndDeletedAtIsNull(departmentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Department not found"));

        department.setDeletedAt(LocalDateTime.now());

        departmentRepository.save(department);

        return ApiResponse.<String>builder()
                .success(true)
                .message("Department deleted successfully")
                .data("Deleted")
                .build();
    }
    
    @Override
    public ApiResponse<String> restoreDepartment(Long departmentId) {

        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Department not found"));

        if (department.getDeletedAt() == null) {
            throw new BusinessException("Department is already active");
        }

        department.setDeletedAt(null);

        departmentRepository.save(department);

        return ApiResponse.<String>builder()
                .success(true)
                .message("Department restored successfully")
                .data("Restored")
                .build();
    }
}