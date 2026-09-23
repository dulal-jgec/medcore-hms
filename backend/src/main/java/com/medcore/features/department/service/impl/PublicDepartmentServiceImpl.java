package com.medcore.features.department.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.features.department.dto.response.PublicDepartmentResponse;
import com.medcore.features.department.entity.Department;
import com.medcore.features.department.enums.DepartmentStatus;
import com.medcore.features.department.mapper.DepartmentMapper;
import com.medcore.features.department.repository.PublicDepartmentRepository;
import com.medcore.features.department.service.PublicDepartmentService;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.enums.HospitalStatus;
import com.medcore.features.hospital.repository.HospitalRepository;

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
public class PublicDepartmentServiceImpl
        implements PublicDepartmentService {

    private final PublicDepartmentRepository departmentRepository;
    private final HospitalRepository hospitalRepository;
    private final DepartmentMapper departmentMapper;

    private static final Set<String> ALLOWED_SORT_FIELDS =
            Set.of(
                    "id",
                    "name",
                    "code",
                    "createdAt"
            );

    @Override
    public ApiResponse<Page<PublicDepartmentResponse>> getDepartments(
            Long hospitalId,
            int page,
            int size,
            String sortBy,
            String sortDir) {

        validatePagination(page, size, sortBy, sortDir);

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

        Sort sort =
                sortDir.trim().equalsIgnoreCase("desc")
                        ? Sort.by(sortBy).descending()
                        : Sort.by(sortBy).ascending();

        Pageable pageable =
                PageRequest.of(page, size, sort);

        Page<Department> departmentPage =
                departmentRepository
                        .findByHospitalIdAndStatusAndDeletedAtIsNull(
                                hospitalId,
                                DepartmentStatus.ACTIVE,
                                pageable
                        );

        Page<PublicDepartmentResponse> responsePage =
                departmentPage.map(
                        departmentMapper::toPublicResponse
                );

        return ApiResponse
                .<Page<PublicDepartmentResponse>>builder()
                .success(true)
                .message("Departments fetched successfully")
                .data(responsePage)
                .build();
    }

    @Override
    public ApiResponse<PublicDepartmentResponse> getDepartment(
            Long hospitalId,
            Long departmentId) {

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

        Department department =
                departmentRepository
                        .findByIdAndHospitalIdAndStatusAndDeletedAtIsNull(
                                departmentId,
                                hospitalId,
                                DepartmentStatus.ACTIVE
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Department not found"
                                )
                        );

        PublicDepartmentResponse response =
                departmentMapper.toPublicResponse(department);

        return ApiResponse
                .<PublicDepartmentResponse>builder()
                .success(true)
                .message("Department fetched successfully")
                .data(response)
                .build();
    }

    private void validatePagination(
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

        if (sortDir == null) {
            throw new BusinessException(
                    "Sort direction is required"
            );
        }

        String normalizedSortDir =
                sortDir.trim().toLowerCase();

        if (!normalizedSortDir.equals("asc")
                && !normalizedSortDir.equals("desc")) {

            throw new BusinessException(
                    "Sort direction must be 'asc' or 'desc'"
            );
        }
    }
}