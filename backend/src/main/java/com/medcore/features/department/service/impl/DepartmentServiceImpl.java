package com.medcore.features.department.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.cache.TenantCacheEvictService;
import com.medcore.common.exception.DuplicateResourceException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.PageResponse;
import com.medcore.common.security.TenantContextService;

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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.transaction.annotation.Transactional;
@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl
        implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final HospitalRepository hospitalRepository;
    private final DepartmentMapper departmentMapper;
    private final TenantContextService tenantContextService;
    private final TenantCacheEvictService tenantCacheEvictService;
    private static final int MAX_PAGE_SIZE = 50;

    private static final Set<String> ALLOWED_SORT_FIELDS =
            Set.of(
                    "id",
                    "name",
                    "code",
                    "createdAt",
                    "updatedAt"
            );
 

    @Override
    @Transactional
    public ApiResponse<DepartmentResponse> createDepartment(
            CreateDepartmentRequest request) {

        Long hospitalId = getCurrentHospitalId();
 
        if (request.getHospitalId() == null
                || !request.getHospitalId().equals(hospitalId)) {

            throw new BusinessException(
                    "Department cannot be created for another hospital"
            );
        }

        Hospital hospital =
                hospitalRepository
                        .findByIdAndDeletedAtIsNull(hospitalId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Hospital not found"
                                ));

        String name =
                request.getName()
                        .trim();

        String code =
                request.getCode()
                        .trim()
                        .toUpperCase();


 
        if (departmentRepository
                .existsByHospitalIdAndNameIgnoreCase(
                        hospitalId,
                        name
                )) {

            throw new DuplicateResourceException(
                    "Department name already exists in this hospital"
            );
        }


 
        if (departmentRepository
                .existsByHospitalIdAndCodeIgnoreCase(
                        hospitalId,
                        code
                )) {

            throw new DuplicateResourceException(
                    "Department code already exists in this hospital"
            );
        }


        Department department =
                departmentMapper.toEntity(
                        request,
                        hospital
                );

        Department savedDepartment =
                departmentRepository.save(
                        department
                );
        
        tenantCacheEvictService.evictDepartments();


        return ApiResponse
                .<DepartmentResponse>builder()
                .success(true)
                .message(
                        "Department created successfully"
                )
                .data(
                        departmentMapper.toResponse(
                                savedDepartment
                        )
                )
                .build();
    }


    @Override
    @Transactional(readOnly = true)
    @Cacheable(
            cacheNames = "departments",
            keyGenerator = "tenantCacheKeyGenerator"
    )
    public ApiResponse<PageResponse<DepartmentResponse>>
    getAllDepartments(
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

        Page<Department> departmentPage =
                departmentRepository
                        .findByHospitalIdAndDeletedAtIsNull(
                                hospitalId,
                                pageable
                        );

        return buildPageResponse(
                departmentPage,
                "Departments fetched successfully"
        );
    }


      @Override
    public ApiResponse<DepartmentResponse>
    getDepartmentById(
            Long departmentId) {

        Long hospitalId =
                getCurrentHospitalId();

        Department department =
                getDepartment(
                        departmentId,
                        hospitalId
                );

        return ApiResponse
                .<DepartmentResponse>builder()
                .success(true)
                .message(
                        "Department fetched successfully"
                )
                .data(
                        departmentMapper.toResponse(
                                department
                        )
                )
                .build();
    }


      @Override
      @Transactional
      public ApiResponse<DepartmentResponse>
      updateDepartment(
              Long departmentId,
              UpdateDepartmentRequest request) {

        Long hospitalId =
                getCurrentHospitalId();

        Department department =
                getDepartment(
                        departmentId,
                        hospitalId
                );
        

        String newName =
                request.getName()
                        .trim();

        String newCode =
                request.getCode()
                        .trim()
                        .toUpperCase();


       

        if (!department.getName()
                .equalsIgnoreCase(newName)
                && departmentRepository
                .existsByHospitalIdAndNameIgnoreCase(
                        hospitalId,
                        newName
                )) {

            throw new DuplicateResourceException(
                    "Department name already exists in this hospital"
            );
        }


        
        if (!department.getCode()
                .equalsIgnoreCase(newCode)
                && departmentRepository
                .existsByHospitalIdAndCodeIgnoreCase(
                        hospitalId,
                        newCode
                )) {

            throw new DuplicateResourceException(
                    "Department code already exists in this hospital"
            );
        }


        departmentMapper.updateEntity(
                department,
                request
        );

        Department updatedDepartment =
                departmentRepository.save(
                        department
                );
        tenantCacheEvictService.evictDepartments();

        return ApiResponse
                .<DepartmentResponse>builder()
                .success(true)
                .message(
                        "Department updated successfully"
                )
                .data(
                        departmentMapper.toResponse(
                                updatedDepartment
                        )
                )
                .build();
    }


    
      @Override
      @Transactional
      public ApiResponse<DepartmentResponse>
      updateDepartmentStatus(
              Long departmentId,
              UpdateDepartmentStatusRequest request) {

        Long hospitalId =
                getCurrentHospitalId();

        Department department =
                getDepartment(
                        departmentId,
                        hospitalId
                );

        if (request.getStatus() == null) {

            throw new BusinessException(
                    "Department status is required"
            );
        }

        department.setStatus(
                request.getStatus()
        );

        Department updatedDepartment =
                departmentRepository.save(
                        department
            
                		);
        
        tenantCacheEvictService.evictDepartments();
        
        return ApiResponse
                .<DepartmentResponse>builder()
                .success(true)
                .message(
                        "Department status updated successfully"
                )
                .data(
                        departmentMapper.toResponse(
                                updatedDepartment
                        )
                )
                .build();
    }


   
    @Override
    @Transactional(readOnly = true)
    @Cacheable(
            cacheNames = "departments",
            keyGenerator = "tenantCacheKeyGenerator"
    )
    public ApiResponse<PageResponse<DepartmentResponse>>
    searchDepartments(
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

        Page<Department> departmentPage =
                departmentRepository
                        .findByHospitalIdAndNameContainingIgnoreCaseAndDeletedAtIsNull(
                                hospitalId,
                                keyword.trim(),
                                pageable
                        );

        return buildPageResponse(
                departmentPage,
                "Departments fetched successfully"
        );
    }


    @Override
    @Transactional
    public ApiResponse<String>
    deleteDepartment(
            Long departmentId) {
        Long hospitalId =
                getCurrentHospitalId();

        Department department =
                getDepartment(
                        departmentId,
                        hospitalId
                );

        department.setDeletedAt(
                LocalDateTime.now()
        );

        departmentRepository.save(
                department
        );
        
        tenantCacheEvictService.evictDepartments();

        return ApiResponse
                .<String>builder()
                .success(true)
                .message(
                        "Department deleted successfully"
                )
                .data("Deleted")
                .build();
    }


    
    @Override
    @Transactional
    public ApiResponse<String>
    restoreDepartment(
            Long departmentId) {

        Long hospitalId =
                getCurrentHospitalId();

        Department department =
                departmentRepository
                        .findByIdAndHospitalId(
                                departmentId,
                                hospitalId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Department not found"
                                )
                        );

        if (department.getDeletedAt() == null) {

            throw new BusinessException(
                    "Department is already active"
            );
        }

        department.setDeletedAt(null);

        departmentRepository.save(
                department
        );
        
        tenantCacheEvictService.evictDepartments();

        return ApiResponse
                .<String>builder()
                .success(true)
                .message(
                        "Department restored successfully"
                )
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


   
    private Department getDepartment(
            Long departmentId,
            Long hospitalId) {

        return departmentRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(
                        departmentId,
                        hospitalId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Department not found"
                        )
                );
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
                || !ALLOWED_SORT_FIELDS.contains(sortBy)) {

            throw new BusinessException(
                    "Invalid sort field"
            );
        }

        return sortBy;
    }


     

    private ApiResponse<PageResponse<DepartmentResponse>>
    buildPageResponse(
            Page<Department> departmentPage,
            String message) {

        List<DepartmentResponse> items =
                departmentPage
                        .getContent()
                        .stream()
                        .map(departmentMapper::toResponse)
                        .toList();

        PageResponse<DepartmentResponse> response =
                PageResponse
                        .<DepartmentResponse>builder()
                        .items(items)
                        .page(departmentPage.getNumber())
                        .size(departmentPage.getSize())
                        .totalElements(
                                departmentPage.getTotalElements()
                        )
                        .totalPages(
                                departmentPage.getTotalPages()
                        )
                        .first(
                                departmentPage.isFirst()
                        )
                        .last(
                                departmentPage.isLast()
                        )
                        .hasNext(
                                departmentPage.hasNext()
                        )
                        .hasPrevious(
                                departmentPage.hasPrevious()
                        )
                        .build();

        return ApiResponse
                .<PageResponse<DepartmentResponse>>builder()
                .success(true)
                .message(message)
                .data(response)
                .build();
    }
}