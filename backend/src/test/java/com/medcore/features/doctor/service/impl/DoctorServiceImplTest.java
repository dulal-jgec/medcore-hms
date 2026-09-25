package com.medcore.features.doctor.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.DuplicateResourceException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.PageResponse;
import com.medcore.common.security.TenantContextService;
import com.medcore.common.storage.FileStorageService;
import com.medcore.common.storage.FileValidationService;
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
import com.medcore.features.hospital.enums.HospitalStatus;
import com.medcore.features.hospital.repository.HospitalRepository;
import com.medcore.features.notification.service.EmailService;
import com.medcore.features.user.entity.Role;
import com.medcore.features.user.entity.User;
import com.medcore.features.user.enums.RoleName;
import com.medcore.features.user.repository.RoleRepository;
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
import org.springframework.security.crypto.password.PasswordEncoder;

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

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private FileValidationService fileValidationService;

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

    // =========================================================
    // CREATE
    // =========================================================

    @Test
    void createDoctor_shouldCreateSuccessfully() {

        CreateDoctorRequest request =
                new CreateDoctorRequest();

        request.setFullName("Dr. John");
        request.setEmail("john@medcore.com");
        request.setPhone("9876543210");
        request.setDepartmentId(10L);
        request.setSpecialization("Cardiology");
        request.setExperienceYears(10);
        request.setConsultationFee(BigDecimal.valueOf(1000));
        request.setQualification("MBBS");

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(hospitalRepository
                .findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(hospital));

        when(hospital.getStatus())
                .thenReturn(HospitalStatus.ACTIVE);

        when(hospital.getName())
                .thenReturn("Apollo Hospital");

        when(department.getId())
                .thenReturn(10L);

        when(userRepository.existsByEmail("john@medcore.com"))
                .thenReturn(false);

        when(userRepository.existsByPhone("9876543210"))
                .thenReturn(false);

        when(roleRepository.findByName(RoleName.DOCTOR))
                .thenReturn(Optional.of(role));

        when(departmentRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(
                        10L,
                        1L
                ))
                .thenReturn(Optional.of(department));

        when(passwordEncoder.encode(any(String.class)))
                .thenReturn("encoded-password");

        User savedUser = mock(User.class);

        when(savedUser.getId())
                .thenReturn(100L);

        when(savedUser.getEmail())
                .thenReturn("john@medcore.com");

        when(savedUser.getFullName())
                .thenReturn("Dr. John");

        when(userRepository.save(any(User.class)))
                .thenReturn(savedUser);

        when(doctorMapper.toEntity(
                request,
                savedUser,
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

        verify(userRepository)
                .save(any(User.class));

        verify(doctorRepository)
                .save(doctor);

        verify(emailService)
                .sendDoctorCredentials(
                        eq("john@medcore.com"),
                        eq("Dr. John"),
                        any(String.class),
                        eq("Apollo Hospital")
                );
    }

    @Test
    void createDoctor_shouldThrowWhenHospitalNotFound() {

        CreateDoctorRequest request =
                new CreateDoctorRequest();

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

        verifyNoInteractions(userRepository);
        verifyNoInteractions(departmentRepository);
        verifyNoInteractions(roleRepository);
    }

    @Test
    void createDoctor_shouldThrowWhenHospitalInactive() {

        CreateDoctorRequest request =
                new CreateDoctorRequest();

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(1L);

        when(hospitalRepository
                .findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(hospital));

        when(hospital.getStatus())
                .thenReturn(HospitalStatus.INACTIVE);

        assertThrows(
                BusinessException.class,
                () -> doctorService.createDoctor(request)
        );

        verifyNoInteractions(userRepository);
        verifyNoInteractions(roleRepository);
        verifyNoInteractions(departmentRepository);
    }

    @Test
    void createDoctor_shouldRejectDuplicateEmail() {

        CreateDoctorRequest request =
                new CreateDoctorRequest();

        request.setFullName("Dr. John");
        request.setEmail("john@medcore.com");
        request.setPhone("9876543210");

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(1L);

        when(hospitalRepository
                .findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(hospital));

        when(hospital.getStatus())
                .thenReturn(HospitalStatus.ACTIVE);

        when(userRepository
                .existsByEmail("john@medcore.com"))
                .thenReturn(true);

        assertThrows(
                DuplicateResourceException.class,
                () -> doctorService.createDoctor(request)
        );

        verify(userRepository, never())
                .existsByPhone(any());

        verifyNoInteractions(roleRepository);
        verifyNoInteractions(departmentRepository);
    }

    @Test
    void createDoctor_shouldRejectDuplicatePhone() {

        CreateDoctorRequest request =
                new CreateDoctorRequest();

        request.setFullName("Dr. John");
        request.setEmail("john@medcore.com");
        request.setPhone("9876543210");

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(1L);

        when(hospitalRepository
                .findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(hospital));

        when(hospital.getStatus())
                .thenReturn(HospitalStatus.ACTIVE);

        when(userRepository
                .existsByEmail("john@medcore.com"))
                .thenReturn(false);

        when(userRepository
                .existsByPhone("9876543210"))
                .thenReturn(true);

        assertThrows(
                DuplicateResourceException.class,
                () -> doctorService.createDoctor(request)
        );

        verifyNoInteractions(roleRepository);
        verifyNoInteractions(departmentRepository);
    }

    @Test
    void createDoctor_shouldThrowWhenDoctorRoleNotFound() {

        CreateDoctorRequest request =
                new CreateDoctorRequest();

        request.setFullName("Dr. John");
        request.setEmail("john@medcore.com");
        request.setPhone("9876543210");

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(1L);

        when(hospitalRepository
                .findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(hospital));

        when(hospital.getStatus())
                .thenReturn(HospitalStatus.ACTIVE);

        when(userRepository
                .existsByEmail("john@medcore.com"))
                .thenReturn(false);

        when(userRepository
                .existsByPhone("9876543210"))
                .thenReturn(false);

        when(roleRepository
                .findByName(RoleName.DOCTOR))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> doctorService.createDoctor(request)
        );

        verifyNoInteractions(departmentRepository);
    }

    @Test
    void createDoctor_shouldThrowWhenDepartmentNotFound() {

        CreateDoctorRequest request =
                new CreateDoctorRequest();

        request.setFullName("Dr. John");
        request.setEmail("john@medcore.com");
        request.setPhone("9876543210");
        request.setDepartmentId(10L);

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(1L);

        when(hospitalRepository
                .findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(hospital));

        when(hospital.getStatus())
                .thenReturn(HospitalStatus.ACTIVE);

        when(userRepository
                .existsByEmail("john@medcore.com"))
                .thenReturn(false);

        when(userRepository
                .existsByPhone("9876543210"))
                .thenReturn(false);

        when(roleRepository
                .findByName(RoleName.DOCTOR))
                .thenReturn(Optional.of(role));

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

        verify(userRepository, never())
                .save(any());

        verify(doctorRepository, never())
                .save(any());
    }

    // =========================================================
    // GET ALL
    // =========================================================

    @Test
    void getAllDoctors_shouldReturnPagedDoctors() {

        Page<Doctor> page =
                new PageImpl<>(List.of(doctor));

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
                result.getData().getItems().size()
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

    // =========================================================
    // GET BY ID
    // =========================================================

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

    // =========================================================
    // UPDATE
    // =========================================================

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

        when(doctorRepository
                .save(doctor))
                .thenReturn(doctor);

        when(doctorMapper
                .toResponse(doctor))
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

    // =========================================================
    // STATUS
    // =========================================================

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

        when(doctorRepository
                .save(doctor))
                .thenReturn(doctor);

        when(doctorMapper
                .toResponse(doctor))
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

    // =========================================================
    // SEARCH
    // =========================================================

    @Test
    void searchDoctors_shouldReturnResults() {

        Page<Doctor> page =
                new PageImpl<>(List.of(doctor));

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

    // =========================================================
    // DELETE
    // =========================================================

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

        when(doctorRepository
                .save(doctor))
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

    // =========================================================
    // RESTORE
    // =========================================================

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

        when(doctorRepository
                .save(doctor))
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

    // =========================================================
    // SUPER ADMIN
    // =========================================================

    @Test
    void getAllDoctors_shouldWorkForSuperAdmin() {

        Page<Doctor> page =
                new PageImpl<>(List.of(doctor));

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