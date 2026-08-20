package com.medcore.features.department.service.impl;

import com.medcore.common.exception.BusinessException;
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
import com.medcore.features.department.enums.DepartmentStatus;
import com.medcore.features.department.mapper.DepartmentMapper;
import com.medcore.features.department.repository.DepartmentRepository;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.enums.HospitalStatus;
import com.medcore.features.hospital.repository.HospitalRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DepartmentServiceImplTest {

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private HospitalRepository hospitalRepository;

    @Mock
    private DepartmentMapper departmentMapper;

    @Mock
    private TenantContextService tenantContextService;

    @InjectMocks
    private DepartmentServiceImpl departmentService;

    private Hospital hospital;
    private Department department;
    private DepartmentResponse response;

    @BeforeEach
    void setUp() {

        hospital = Hospital.builder()
                .name("Apollo Hospital")
                .email("apollo@medcore.com")
                .phone("9876543210")
                .licenseNumber("APH-2026-001")
                .city("Kolkata")
                .status(HospitalStatus.ACTIVE)
                .build();

        hospital.setId(1L);

        department = Department.builder()
                .name("Cardiology")
                .code("CARD")
                .description("Heart department")
                .hospital(hospital)
                .status(DepartmentStatus.ACTIVE)
                .build();

        department.setId(10L);

        response = DepartmentResponse.builder()
                .id(10L)
                .name("Cardiology")
                .code("CARD")
                .description("Heart department")
                .hospitalId(1L)
                .hospitalName("Apollo Hospital")
                .status(DepartmentStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createDepartment_shouldCreateSuccessfully() {

        CreateDepartmentRequest request = new CreateDepartmentRequest();
        request.setHospitalId(1L);
        request.setName("Cardiology");
        request.setCode("CARD");
        request.setDescription("Heart department");

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(hospitalRepository.findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(hospital));

        when(departmentRepository.existsByHospitalIdAndNameIgnoreCase(
                1L, "Cardiology"))
                .thenReturn(false);

        when(departmentRepository.existsByHospitalIdAndCodeIgnoreCase(
                1L, "CARD"))
                .thenReturn(false);

        when(departmentMapper.toEntity(request, hospital))
                .thenReturn(department);

        when(departmentRepository.save(department))
                .thenReturn(department);

        when(departmentMapper.toResponse(department))
                .thenReturn(response);

        ApiResponse<DepartmentResponse> result =
                departmentService.createDepartment(request);

        assertTrue(result.isSuccess());
        assertEquals("Department created successfully", result.getMessage());
        assertEquals(response, result.getData());

        verify(departmentRepository).save(department);
    }

    @Test
    void createDepartment_shouldRejectDifferentHospital() {

        CreateDepartmentRequest request = new CreateDepartmentRequest();
        request.setHospitalId(2L);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        assertThrows(
                BusinessException.class,
                () -> departmentService.createDepartment(request)
        );

        verifyNoInteractions(hospitalRepository);
    }

    @Test
    void createDepartment_shouldRejectDuplicateName() {

        CreateDepartmentRequest request = new CreateDepartmentRequest();
        request.setHospitalId(1L);
        request.setName("Cardiology");
        request.setCode("CARD");

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(hospitalRepository.findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(hospital));

        when(departmentRepository.existsByHospitalIdAndNameIgnoreCase(
                1L, "Cardiology"))
                .thenReturn(true);

        assertThrows(
                DuplicateResourceException.class,
                () -> departmentService.createDepartment(request)
        );

        verify(departmentRepository, never()).save(any());
    }

    @Test
    void createDepartment_shouldRejectDuplicateCode() {

        CreateDepartmentRequest request = new CreateDepartmentRequest();
        request.setHospitalId(1L);
        request.setName("Cardiology");
        request.setCode("CARD");

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(hospitalRepository.findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(hospital));

        when(departmentRepository.existsByHospitalIdAndNameIgnoreCase(
                1L, "Cardiology"))
                .thenReturn(false);

        when(departmentRepository.existsByHospitalIdAndCodeIgnoreCase(
                1L, "CARD"))
                .thenReturn(true);

        assertThrows(
                DuplicateResourceException.class,
                () -> departmentService.createDepartment(request)
        );

        verify(departmentRepository, never()).save(any());
    }

    @Test
    void createDepartment_shouldThrowWhenHospitalNotFound() {

        CreateDepartmentRequest request = new CreateDepartmentRequest();
        request.setHospitalId(1L);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(hospitalRepository.findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> departmentService.createDepartment(request)
        );
    }

    @Test
    void getDepartmentById_shouldReturnDepartment() {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(departmentRepository.findByIdAndHospitalIdAndDeletedAtIsNull(
                10L, 1L))
                .thenReturn(Optional.of(department));

        when(departmentMapper.toResponse(department))
                .thenReturn(response);

        ApiResponse<DepartmentResponse> result =
                departmentService.getDepartmentById(10L);

        assertTrue(result.isSuccess());
        assertEquals(response, result.getData());
    }

    @Test
    void getDepartmentById_shouldThrowWhenNotFound() {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(departmentRepository.findByIdAndHospitalIdAndDeletedAtIsNull(
                10L, 1L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> departmentService.getDepartmentById(10L)
        );
    }

    @Test
    void updateDepartment_shouldUpdateSuccessfully() {

        UpdateDepartmentRequest request =
                new UpdateDepartmentRequest();

        request.setName("Neurology");
        request.setCode("NEUR");
        request.setDescription("Brain department");

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(departmentRepository.findByIdAndHospitalIdAndDeletedAtIsNull(
                10L, 1L))
                .thenReturn(Optional.of(department));

        when(departmentRepository.existsByHospitalIdAndNameIgnoreCase(
                1L, "Neurology"))
                .thenReturn(false);

        when(departmentRepository.existsByHospitalIdAndCodeIgnoreCase(
                1L, "NEUR"))
                .thenReturn(false);

        when(departmentRepository.save(department))
                .thenReturn(department);

        when(departmentMapper.toResponse(department))
                .thenReturn(response);

        ApiResponse<DepartmentResponse> result =
                departmentService.updateDepartment(10L, request);

        assertTrue(result.isSuccess());

        verify(departmentMapper)
                .updateEntity(department, request);

        verify(departmentRepository)
                .save(department);
    }

    @Test
    void updateDepartment_shouldRejectDuplicateName() {

        UpdateDepartmentRequest request =
                new UpdateDepartmentRequest();

        request.setName("Neurology");
        request.setCode("CARD");

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(departmentRepository.findByIdAndHospitalIdAndDeletedAtIsNull(
                10L, 1L))
                .thenReturn(Optional.of(department));

        when(departmentRepository.existsByHospitalIdAndNameIgnoreCase(
                1L, "Neurology"))
                .thenReturn(true);

        assertThrows(
                DuplicateResourceException.class,
                () -> departmentService.updateDepartment(10L, request)
        );

        verify(departmentRepository, never()).save(any());
    }

    @Test
    void updateDepartment_shouldRejectDuplicateCode() {

        UpdateDepartmentRequest request =
                new UpdateDepartmentRequest();

        request.setName("Neurology");
        request.setCode("NEUR");

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(departmentRepository.findByIdAndHospitalIdAndDeletedAtIsNull(
                10L, 1L))
                .thenReturn(Optional.of(department));

        when(departmentRepository.existsByHospitalIdAndNameIgnoreCase(
                1L, "Neurology"))
                .thenReturn(false);

        when(departmentRepository.existsByHospitalIdAndCodeIgnoreCase(
                1L, "NEUR"))
                .thenReturn(true);

        assertThrows(
                DuplicateResourceException.class,
                () -> departmentService.updateDepartment(10L, request)
        );

        verify(departmentRepository, never()).save(any());
    }

    @Test
    void updateDepartmentStatus_shouldUpdateSuccessfully() {

        UpdateDepartmentStatusRequest request =
                new UpdateDepartmentStatusRequest();

        request.setStatus(DepartmentStatus.INACTIVE);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(departmentRepository.findByIdAndHospitalIdAndDeletedAtIsNull(
                10L, 1L))
                .thenReturn(Optional.of(department));

        when(departmentRepository.save(department))
                .thenReturn(department);

        when(departmentMapper.toResponse(department))
                .thenReturn(response);

        ApiResponse<DepartmentResponse> result =
                departmentService.updateDepartmentStatus(10L, request);

        assertTrue(result.isSuccess());
        assertEquals(
                DepartmentStatus.INACTIVE,
                department.getStatus()
        );

        verify(departmentRepository).save(department);
    }

    @Test
    void updateDepartmentStatus_shouldRejectNullStatus() {

        UpdateDepartmentStatusRequest request =
                new UpdateDepartmentStatusRequest();

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(departmentRepository.findByIdAndHospitalIdAndDeletedAtIsNull(
                10L, 1L))
                .thenReturn(Optional.of(department));

        assertThrows(
                BusinessException.class,
                () -> departmentService.updateDepartmentStatus(10L, request)
        );

        verify(departmentRepository, never()).save(any());
    }

    @Test
    void getAllDepartments_shouldReturnPagedDepartments() {

        Page<Department> page =
                new PageImpl<>(List.of(department));

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(departmentRepository.findByHospitalIdAndDeletedAtIsNull(
                eq(1L),
                any(Pageable.class)))
                .thenReturn(page);

        when(departmentMapper.toResponse(department))
                .thenReturn(response);

        ApiResponse<PageResponse<DepartmentResponse>> result =
                departmentService.getAllDepartments(
                        0,
                        10,
                        "name",
                        "asc"
                );

        assertTrue(result.isSuccess());
        assertEquals(
                1,
                result.getData().getItems().size()
        );

        verify(departmentRepository)
                .findByHospitalIdAndDeletedAtIsNull(
                        eq(1L),
                        any(Pageable.class)
                );
    }

    @Test
    void getAllDepartments_shouldRejectInvalidPage() {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        assertThrows(
                BusinessException.class,
                () -> departmentService.getAllDepartments(
                        -1,
                        10,
                        "name",
                        "asc"
                )
        );
    }

    @Test
    void getAllDepartments_shouldRejectLargePageSize() {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        assertThrows(
                BusinessException.class,
                () -> departmentService.getAllDepartments(
                        0,
                        51,
                        "name",
                        "asc"
                )
        );
    }

    @Test
    void getAllDepartments_shouldRejectInvalidSortField() {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        assertThrows(
                BusinessException.class,
                () -> departmentService.getAllDepartments(
                        0,
                        10,
                        "invalid",
                        "asc"
                )
        );
    }

    @Test
    void searchDepartments_shouldReturnResults() {

        Page<Department> page =
                new PageImpl<>(List.of(department));

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(departmentRepository
                .findByHospitalIdAndNameContainingIgnoreCaseAndDeletedAtIsNull(
                        eq(1L),
                        eq("Card"),
                        any(Pageable.class)))
                .thenReturn(page);

        when(departmentMapper.toResponse(department))
                .thenReturn(response);

        ApiResponse<PageResponse<DepartmentResponse>> result =
                departmentService.searchDepartments(
                        " Card ",
                        0,
                        10
                );

        assertTrue(result.isSuccess());
        assertEquals(
                1,
                result.getData().getItems().size()
        );
    }

    @Test
    void searchDepartments_shouldRejectEmptyKeyword() {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        assertThrows(
                BusinessException.class,
                () -> departmentService.searchDepartments(
                        "   ",
                        0,
                        10
                )
        );
    }

    @Test
    void deleteDepartment_shouldSoftDelete() {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(departmentRepository.findByIdAndHospitalIdAndDeletedAtIsNull(
                10L, 1L))
                .thenReturn(Optional.of(department));

        when(departmentRepository.save(department))
                .thenReturn(department);

        ApiResponse<String> result =
                departmentService.deleteDepartment(10L);

        assertTrue(result.isSuccess());
        assertEquals("Deleted", result.getData());
        assertNotNull(department.getDeletedAt());

        verify(departmentRepository).save(department);
    }

    @Test
    void restoreDepartment_shouldRestoreSuccessfully() {

        department.setDeletedAt(LocalDateTime.now());

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(departmentRepository.findByIdAndHospitalId(
                10L, 1L))
                .thenReturn(Optional.of(department));

        when(departmentRepository.save(department))
                .thenReturn(department);

        ApiResponse<String> result =
                departmentService.restoreDepartment(10L);

        assertTrue(result.isSuccess());
        assertEquals("Restored", result.getData());
        assertNull(department.getDeletedAt());

        verify(departmentRepository).save(department);
    }

    @Test
    void restoreDepartment_shouldRejectAlreadyActiveDepartment() {

        department.setDeletedAt(null);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(departmentRepository.findByIdAndHospitalId(
                10L, 1L))
                .thenReturn(Optional.of(department));

        assertThrows(
                BusinessException.class,
                () -> departmentService.restoreDepartment(10L)
        );

        verify(departmentRepository, never()).save(any());
    }
}