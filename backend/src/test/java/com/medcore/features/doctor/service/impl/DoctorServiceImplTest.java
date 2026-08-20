package com.medcore.features.doctor.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.DuplicateResourceException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.PageResponse;
import com.medcore.common.security.TenantContextService;
import com.medcore.features.department.entity.Department;
import com.medcore.features.department.repository.DepartmentRepository;
import com.medcore.features.doctor.dto.request.CreateDoctorRequest;
import com.medcore.features.doctor.dto.request.UpdateDoctorRequest;
import com.medcore.features.doctor.dto.request.UpdateDoctorStatusRequest;
import com.medcore.features.doctor.dto.response.DoctorResponse;
import com.medcore.features.doctor.entity.Doctor;
import com.medcore.features.doctor.enums.DoctorStatus;
import com.medcore.features.doctor.mapper.DoctorMapper;
import com.medcore.features.doctor.repository.DoctorRepository;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.repository.HospitalRepository;
import com.medcore.features.user.entity.Role;
import com.medcore.features.user.entity.User;
import com.medcore.features.user.enums.RoleName;
import com.medcore.features.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DoctorServiceImplTest {

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private HospitalRepository hospitalRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private DoctorMapper doctorMapper;

    @Mock
    private TenantContextService tenantContextService;

    @InjectMocks
    private DoctorServiceImpl doctorService;

    private Hospital hospital;
    private Department department;
    private User user;
    private Role role;
    private Doctor doctor;
    private DoctorResponse response;

    @BeforeEach
    void setUp() {

        hospital = mock(Hospital.class);
        department = mock(Department.class);
        user = mock(User.class);
        role = mock(Role.class);
        doctor = mock(Doctor.class);

        response = DoctorResponse.builder()
                .id(50L)
                .userId(100L)
                .doctorName("Dr. John")
                .email("john@medcore.com")
                .hospitalId(1L)
                .hospitalName("Apollo Hospital")
                .departmentId(10L)
                .departmentName("Cardiology")
                .specialization("Cardiology")
                .experienceYears(10)
                .consultationFee(BigDecimal.valueOf(1000))
                .qualification("MBBS")
                .status(DoctorStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createDoctor_shouldCreateSuccessfully() {

        CreateDoctorRequest request =
                new CreateDoctorRequest();

        request.setUserId(100L);
        request.setHospitalId(1L);
        request.setDepartmentId(10L);
        request.setSpecialization("Cardiology");
        request.setExperienceYears(10);
        request.setConsultationFee(
                BigDecimal.valueOf(1000)
        );
        request.setQualification("MBBS");

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(hospital.getId())
                .thenReturn(1L);

        when(user.getId())
                .thenReturn(100L);

        when(user.getRole())
                .thenReturn(role);

        when(role.getName())
                .thenReturn(RoleName.DOCTOR);

        when(user.getHospital())
                .thenReturn(hospital);

        when(department.getHospital())
                .thenReturn(hospital);

        when(hospitalRepository
                .findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(hospital));

        when(userRepository.findById(100L))
                .thenReturn(Optional.of(user));

        when(doctorRepository.existsByUserId(100L))
                .thenReturn(false);

        when(departmentRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(
                        10L,
                        1L
                ))
                .thenReturn(Optional.of(department));

        when(doctorMapper.toEntity(
                request,
                user,
                hospital,
                department
        )).thenReturn(doctor);

        when(doctorRepository.save(doctor))
                .thenReturn(doctor);

        when(doctorMapper.toResponse(doctor))
                .thenReturn(response);

        ApiResponse<DoctorResponse> result =
                doctorService.createDoctor(request);

        assertTrue(result.isSuccess());

        assertEquals(
                "Doctor created successfully",
                result.getMessage()
        );

        assertEquals(
                response,
                result.getData()
        );

        verify(doctorRepository)
                .save(doctor);
    }

    @Test
    void createDoctor_shouldRejectDifferentHospital() {

        CreateDoctorRequest request =
                new CreateDoctorRequest();

        request.setHospitalId(2L);

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(1L);

        assertThrows(
                BusinessException.class,
                () -> doctorService.createDoctor(request)
        );

        verifyNoInteractions(hospitalRepository);
    }

    @Test
    void createDoctor_shouldThrowWhenHospitalNotFound() {

        CreateDoctorRequest request =
                new CreateDoctorRequest();

        request.setHospitalId(1L);

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(1L);

        when(hospitalRepository
                .findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> doctorService.createDoctor(request)
        );
    }

    @Test
    void createDoctor_shouldThrowWhenUserNotFound() {

        CreateDoctorRequest request =
                new CreateDoctorRequest();

        request.setHospitalId(1L);
        request.setUserId(100L);

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(1L);

        when(hospitalRepository
                .findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(hospital));

        when(userRepository.findById(100L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> doctorService.createDoctor(request)
        );
    }

    @Test
    void createDoctor_shouldRejectWrongRole() {

        CreateDoctorRequest request =
                new CreateDoctorRequest();

        request.setHospitalId(1L);
        request.setUserId(100L);

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(1L);

        when(hospitalRepository
                .findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(hospital));

        when(userRepository.findById(100L))
                .thenReturn(Optional.of(user));

        when(user.getRole())
                .thenReturn(role);

        when(role.getName())
                .thenReturn(RoleName.PATIENT);

        assertThrows(
                BusinessException.class,
                () -> doctorService.createDoctor(request)
        );
    }

    @Test
    void createDoctor_shouldRejectDuplicateDoctorProfile() {

        CreateDoctorRequest request =
                new CreateDoctorRequest();

        request.setHospitalId(1L);
        request.setUserId(100L);

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(1L);

        when(hospitalRepository
                .findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(hospital));

        when(userRepository.findById(100L))
                .thenReturn(Optional.of(user));

        when(user.getRole())
                .thenReturn(role);

        when(role.getName())
                .thenReturn(RoleName.DOCTOR);

        when(user.getId())
                .thenReturn(100L);

        when(doctorRepository.existsByUserId(100L))
                .thenReturn(true);

        assertThrows(
                DuplicateResourceException.class,
                () -> doctorService.createDoctor(request)
        );
    }

    @Test
    void createDoctor_shouldThrowWhenDepartmentNotFound() {

        CreateDoctorRequest request =
                new CreateDoctorRequest();

        request.setHospitalId(1L);
        request.setUserId(100L);
        request.setDepartmentId(10L);

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(1L);

        when(hospitalRepository
                .findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(hospital));

        when(userRepository.findById(100L))
                .thenReturn(Optional.of(user));

        when(user.getRole())
                .thenReturn(role);

        when(role.getName())
                .thenReturn(RoleName.DOCTOR);

        when(user.getId())
                .thenReturn(100L);

        when(doctorRepository
                .existsByUserId(100L))
                .thenReturn(false);

        when(departmentRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(
                        10L,
                        1L
                ))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> doctorService.createDoctor(request)
        );
    }

    @Test
    void createDoctor_shouldRejectDepartmentFromAnotherHospital() {

        CreateDoctorRequest request =
                new CreateDoctorRequest();

        request.setHospitalId(1L);
        request.setUserId(100L);
        request.setDepartmentId(10L);

        Hospital anotherHospital =
                mock(Hospital.class);

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(1L);

        when(hospitalRepository
                .findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(hospital));

        when(userRepository.findById(100L))
                .thenReturn(Optional.of(user));

        when(user.getRole())
                .thenReturn(role);

        when(role.getName())
                .thenReturn(RoleName.DOCTOR);

        when(user.getId())
                .thenReturn(100L);

        when(doctorRepository
                .existsByUserId(100L))
                .thenReturn(false);

        when(departmentRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(
                        10L,
                        1L
                ))
                .thenReturn(Optional.of(department));

        when(department.getHospital())
                .thenReturn(anotherHospital);

        when(anotherHospital.getId())
                .thenReturn(2L);

        assertThrows(
                BusinessException.class,
                () -> doctorService.createDoctor(request)
        );
    }

    @Test
    void createDoctor_shouldRejectUserFromAnotherHospital() {

        CreateDoctorRequest request =
                new CreateDoctorRequest();

        request.setHospitalId(1L);
        request.setUserId(100L);
        request.setDepartmentId(10L);

        Hospital anotherHospital =
                mock(Hospital.class);

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(1L);

        when(hospitalRepository
                .findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(hospital));

        when(userRepository.findById(100L))
                .thenReturn(Optional.of(user));

        when(user.getRole())
                .thenReturn(role);

        when(role.getName())
                .thenReturn(RoleName.DOCTOR);

        when(user.getId())
                .thenReturn(100L);

        when(doctorRepository
                .existsByUserId(100L))
                .thenReturn(false);

        when(departmentRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(
                        10L,
                        1L
                ))
                .thenReturn(Optional.of(department));

        when(department.getHospital())
                .thenReturn(hospital);

        when(hospital.getId())
                .thenReturn(1L);

        when(user.getHospital())
                .thenReturn(anotherHospital);

        when(anotherHospital.getId())
                .thenReturn(2L);

        assertThrows(
                BusinessException.class,
                () -> doctorService.createDoctor(request)
        );
    }

    @Test
    void getAllDoctors_shouldReturnPagedDoctors() {

        Page<Doctor> page =
                new PageImpl<>(
                        List.of(doctor)
                );

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(1L);

        when(doctorRepository
                .findByHospitalIdAndDeletedAtIsNull(
                        eq(1L),
                        any(Pageable.class)
                ))
                .thenReturn(page);

        when(doctorMapper
                .toResponse(doctor))
                .thenReturn(response);

        ApiResponse<PageResponse<DoctorResponse>> result =
                doctorService.getAllDoctors(
                        0,
                        10,
                        "specialization",
                        "asc"
                );

        assertTrue(result.isSuccess());

        assertEquals(
                1,
                result.getData()
                        .getItems()
                        .size()
        );

        verify(doctorRepository)
                .findByHospitalIdAndDeletedAtIsNull(
                        eq(1L),
                        any(Pageable.class)
                );
    }

    @Test
    void getAllDoctors_shouldRejectInvalidPage() {

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(1L);

        assertThrows(
                BusinessException.class,
                () -> doctorService.getAllDoctors(
                        -1,
                        10,
                        "id",
                        "asc"
                )
        );
    }

    @Test
    void getAllDoctors_shouldRejectInvalidSize() {

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(1L);

        assertThrows(
                BusinessException.class,
                () -> doctorService.getAllDoctors(
                        0,
                        101,
                        "id",
                        "asc"
                )
        );
    }

    @Test
    void getAllDoctors_shouldRejectInvalidSortField() {

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(1L);

        assertThrows(
                BusinessException.class,
                () -> doctorService.getAllDoctors(
                        0,
                        10,
                        "invalid",
                        "asc"
                )
        );
    }

    @Test
    void getAllDoctors_shouldRejectInvalidSortDirection() {

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(1L);

        assertThrows(
                BusinessException.class,
                () -> doctorService.getAllDoctors(
                        0,
                        10,
                        "id",
                        "wrong"
                )
        );
    }

    @Test
    void getDoctorById_shouldReturnDoctor() {

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(1L);

        when(doctorRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(
                        50L,
                        1L
                ))
                .thenReturn(Optional.of(doctor));

        when(doctorMapper
                .toResponse(doctor))
                .thenReturn(response);

        ApiResponse<DoctorResponse> result =
                doctorService.getDoctorById(50L);

        assertTrue(result.isSuccess());

        assertEquals(
                response,
                result.getData()
        );
    }

    @Test
    void getDoctorById_shouldThrowWhenNotFound() {

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(1L);

        when(doctorRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(
                        50L,
                        1L
                ))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> doctorService.getDoctorById(50L)
        );
    }

    @Test
    void updateDoctor_shouldUpdateSuccessfully() {

        UpdateDoctorRequest request =
                new UpdateDoctorRequest();

        request.setSpecialization("Neurology");
        request.setExperienceYears(12);
        request.setConsultationFee(
                BigDecimal.valueOf(1500)
        );
        request.setQualification("MD");

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(1L);

        when(doctorRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(
                        50L,
                        1L
                ))
                .thenReturn(Optional.of(doctor));

        when(doctorRepository.save(doctor))
                .thenReturn(doctor);

        when(doctorMapper.toResponse(doctor))
                .thenReturn(response);

        ApiResponse<DoctorResponse> result =
                doctorService.updateDoctor(
                        50L,
                        request
                );

        assertTrue(result.isSuccess());

        verify(doctorMapper)
                .updateEntity(
                        doctor,
                        request
                );

        verify(doctorRepository)
                .save(doctor);
    }

    @Test
    void updateDoctor_shouldThrowWhenNotFound() {

        UpdateDoctorRequest request =
                new UpdateDoctorRequest();

        request.setSpecialization("Neurology");
        request.setExperienceYears(12);
        request.setConsultationFee(
                BigDecimal.valueOf(1500)
        );
        request.setQualification("MD");

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(1L);

        when(doctorRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(
                        50L,
                        1L
                ))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> doctorService.updateDoctor(
                        50L,
                        request
                )
        );
    }

    @Test
    void updateDoctorStatus_shouldUpdateSuccessfully() {

        UpdateDoctorStatusRequest request =
                new UpdateDoctorStatusRequest();

        request.setStatus(
                DoctorStatus.INACTIVE
        );

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(1L);

        when(doctorRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(
                        50L,
                        1L
                ))
                .thenReturn(Optional.of(doctor));

        when(doctorRepository.save(doctor))
                .thenReturn(doctor);

        when(doctorMapper.toResponse(doctor))
                .thenReturn(response);

        ApiResponse<DoctorResponse> result =
                doctorService.updateDoctorStatus(
                        50L,
                        request
                );

        assertTrue(result.isSuccess());

        verify(doctor)
                .setStatus(
                        DoctorStatus.INACTIVE
                );

        verify(doctorRepository)
                .save(doctor);
    }

    @Test
    void updateDoctorStatus_shouldThrowWhenNotFound() {

        UpdateDoctorStatusRequest request =
                new UpdateDoctorStatusRequest();

        request.setStatus(
                DoctorStatus.INACTIVE
        );

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(1L);

        when(doctorRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(
                        50L,
                        1L
                ))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> doctorService.updateDoctorStatus(
                        50L,
                        request
                )
        );
    }

    @Test
    void searchDoctors_shouldReturnResults() {

        Page<Doctor> page =
                new PageImpl<>(
                        List.of(doctor)
                );

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(1L);

        when(doctorRepository
                .findByHospitalIdAndSpecializationContainingIgnoreCaseAndDeletedAtIsNull(
                        eq(1L),
                        eq("Card"),
                        any(Pageable.class)
                ))
                .thenReturn(page);

        when(doctorMapper
                .toResponse(doctor))
                .thenReturn(response);

        ApiResponse<PageResponse<DoctorResponse>> result =
                doctorService.searchDoctors(
                        " Card ",
                        0,
                        10
                );

        assertTrue(result.isSuccess());

        assertEquals(
                1,
                result.getData()
                        .getItems()
                        .size()
        );
    }

    @Test
    void searchDoctors_shouldRejectEmptyKeyword() {

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(1L);

        assertThrows(
                BusinessException.class,
                () -> doctorService.searchDoctors(
                        "   ",
                        0,
                        10
                )
        );
    }

    @Test
    void searchDoctors_shouldRejectInvalidPage() {

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(1L);

        assertThrows(
                BusinessException.class,
                () -> doctorService.searchDoctors(
                        "Card",
                        -1,
                        10
                )
        );
    }

    @Test
    void searchDoctors_shouldRejectInvalidSize() {

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(1L);

        assertThrows(
                BusinessException.class,
                () -> doctorService.searchDoctors(
                        "Card",
                        0,
                        101
                )
        );
    }

    @Test
    void deleteDoctor_shouldSoftDelete() {

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(1L);

        when(doctorRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(
                        50L,
                        1L
                ))
                .thenReturn(Optional.of(doctor));

        when(doctorRepository.save(doctor))
                .thenReturn(doctor);

        ApiResponse<String> result =
                doctorService.deleteDoctor(50L);

        assertTrue(result.isSuccess());

        assertEquals(
                "Deleted",
                result.getData()
        );

        verify(doctor)
                .setDeletedAt(
                        any(LocalDateTime.class)
                );

        verify(doctorRepository)
                .save(doctor);
    }

    @Test
    void deleteDoctor_shouldThrowWhenNotFound() {

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(1L);

        when(doctorRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(
                        50L,
                        1L
                ))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> doctorService.deleteDoctor(50L)
        );

        verify(doctorRepository, never())
                .save(any());
    }

    @Test
    void restoreDoctor_shouldRestoreSuccessfully() {

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(1L);

        when(doctorRepository
                .findByIdAndHospitalId(
                        50L,
                        1L
                ))
                .thenReturn(Optional.of(doctor));

        when(doctor.getDeletedAt())
                .thenReturn(LocalDateTime.now());

        when(doctorRepository.save(doctor))
                .thenReturn(doctor);

        ApiResponse<String> result =
                doctorService.restoreDoctor(50L);

        assertTrue(result.isSuccess());

        assertEquals(
                "Restored",
                result.getData()
        );

        verify(doctor)
                .setDeletedAt(null);

        verify(doctorRepository)
                .save(doctor);
    }

    @Test
    void restoreDoctor_shouldRejectAlreadyActiveDoctor() {

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(1L);

        when(doctorRepository
                .findByIdAndHospitalId(
                        50L,
                        1L
                ))
                .thenReturn(Optional.of(doctor));

        when(doctor.getDeletedAt())
                .thenReturn(null);

        assertThrows(
                BusinessException.class,
                () -> doctorService.restoreDoctor(50L)
        );

        verify(doctorRepository, never())
                .save(any());
    }

    @Test
    void restoreDoctor_shouldThrowWhenNotFound() {

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(1L);

        when(doctorRepository
                .findByIdAndHospitalId(
                        50L,
                        1L
                ))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> doctorService.restoreDoctor(50L)
        );
    }

    @Test
    void getAllDoctors_shouldWorkForSuperAdmin() {

        Page<Doctor> page =
                new PageImpl<>(
                        List.of(doctor)
                );

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(null);

        when(doctorRepository
                .findByDeletedAtIsNull(
                        any(Pageable.class)
                ))
                .thenReturn(page);

        when(doctorMapper
                .toResponse(doctor))
                .thenReturn(response);

        ApiResponse<PageResponse<DoctorResponse>> result =
                doctorService.getAllDoctors(
                        0,
                        10,
                        "id",
                        "asc"
                );

        assertTrue(result.isSuccess());

        assertEquals(
                1,
                result.getData()
                        .getItems()
                        .size()
        );

        verify(doctorRepository)
                .findByDeletedAtIsNull(
                        any(Pageable.class)
                );
    }

    @Test
    void getDoctorById_shouldWorkForSuperAdmin() {

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(null);

        when(doctorRepository
                .findByIdAndDeletedAtIsNull(50L))
                .thenReturn(Optional.of(doctor));

        when(doctorMapper
                .toResponse(doctor))
                .thenReturn(response);

        ApiResponse<DoctorResponse> result =
                doctorService.getDoctorById(50L);

        assertTrue(result.isSuccess());

        assertEquals(
                response,
                result.getData()
        );
    }
}