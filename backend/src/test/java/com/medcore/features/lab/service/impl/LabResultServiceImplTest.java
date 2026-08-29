package com.medcore.features.lab.service.impl;

import com.medcore.common.cache.TenantCacheEvictService;
import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.security.SecurityUtil;
import com.medcore.common.security.TenantContextService;

import com.medcore.features.doctor.entity.Doctor;
import com.medcore.features.doctor.repository.DoctorRepository;

import com.medcore.features.hospital.entity.Hospital;

import com.medcore.features.lab.dto.request.CreateLabResultRequest;
import com.medcore.features.lab.dto.response.LabResultResponse;

import com.medcore.features.lab.entity.LabOrder;
import com.medcore.features.lab.entity.LabOrderItem;
import com.medcore.features.lab.entity.LabResult;

import com.medcore.features.lab.enums.LabOrderStatus;

import com.medcore.features.lab.mapper.LabResultMapper;

import com.medcore.features.lab.repository.LabOrderItemRepository;
import com.medcore.features.lab.repository.LabOrderRepository;
import com.medcore.features.lab.repository.LabResultRepository;

import com.medcore.features.patient.entity.Patient;
import com.medcore.features.patient.repository.PatientRepository;

import com.medcore.features.user.entity.Role;
import com.medcore.features.user.entity.User;
import com.medcore.features.user.enums.RoleName;
import com.medcore.features.user.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;

import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;


@ExtendWith(MockitoExtension.class)
class LabResultServiceImplTest {

    @Mock
    private LabResultRepository labResultRepository;

    @Mock
    private LabOrderItemRepository labOrderItemRepository;

    @Mock
    private LabOrderRepository labOrderRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private LabResultMapper labResultMapper;

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private TenantContextService tenantContextService;

    @Mock
    private TenantCacheEvictService tenantCacheEvictService;

    @InjectMocks
    private LabResultServiceImpl labResultService;

    private User user;
    private Role role;

    private LabOrder labOrder;
    private LabOrderItem orderItem;
    private LabResult labResult;

    private LabResultResponse response;

    private Doctor doctor;
    private Patient patient;
    private Hospital hospital;


    @BeforeEach
    void setUp() {

        user = mock(User.class);
        role = mock(Role.class);

        labOrder = mock(LabOrder.class);
        orderItem = mock(LabOrderItem.class);
        labResult = mock(LabResult.class);

        doctor = mock(Doctor.class);
        patient = mock(Patient.class);
        hospital = mock(Hospital.class);

        response = LabResultResponse.builder()
                .id(100L)
                .build();
    }


    // ============================================================
    // HELPER METHODS
    // ============================================================

    private void mockLabTechnician() {

        when(user.getRole())
                .thenReturn(role);

        when(role.getName())
                .thenReturn(RoleName.LAB_TECHNICIAN);
    }


    private void mockDoctorRole() {

        when(user.getRole())
                .thenReturn(role);

        when(role.getName())
                .thenReturn(RoleName.DOCTOR);
    }


    private void mockPatientRole() {

        when(user.getRole())
                .thenReturn(role);

        when(role.getName())
                .thenReturn(RoleName.PATIENT);
    }


    private void mockSuperAdminRole() {

        when(user.getRole())
                .thenReturn(role);

        when(role.getName())
                .thenReturn(RoleName.SUPER_ADMIN);
    }


    private void mockCurrentUser(String email) {

        when(userRepository.findByEmail(email))
                .thenReturn(Optional.of(user));
    }


    private void mockLabOrderItem() {

        when(labOrderItemRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(orderItem));

        when(orderItem.getLabOrder())
                .thenReturn(labOrder);
    }


    private void mockHospital(
            Long currentHospitalId,
            Long orderHospitalId) {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(currentHospitalId);

        when(labOrder.getHospital())
                .thenReturn(hospital);

        when(hospital.getId())
                .thenReturn(orderHospitalId);
    }


    private CreateLabResultRequest createRequest() {

        CreateLabResultRequest request =
                new CreateLabResultRequest();

        request.setResultValue("120");
        request.setUnit("mg/dL");
        request.setReferenceRange("70-100");
        request.setRemarks("Slightly high");
        request.setAbnormal(true);

        return request;
    }


    // ============================================================
    // CREATE RESULT
    // ============================================================

    @Test
    void createResult_shouldCreateSuccessfullyAndCompleteOrder() {

        CreateLabResultRequest request =
                createRequest();

        mockCurrentUser("lab@medcore.com");
        mockLabTechnician();
        mockLabOrderItem();
        mockHospital(1L, 1L);

        when(labOrder.getStatus())
                .thenReturn(LabOrderStatus.PROCESSING);

        when(labResultRepository
                .existsByLabOrderItemIdAndDeletedAtIsNull(10L))
                .thenReturn(false)
                .thenReturn(true);

        when(labResultMapper.toEntity(
                request,
                orderItem
        )).thenReturn(labResult);

        when(labResultRepository.save(labResult))
                .thenReturn(labResult);

        when(labOrder.getId())
                .thenReturn(20L);

        when(orderItem.getId())
                .thenReturn(10L);

        when(labOrderItemRepository
                .findByLabOrderIdAndDeletedAtIsNull(20L))
                .thenReturn(List.of(orderItem));

        when(labResultMapper.toResponse(labResult))
                .thenReturn(response);

        when(user.getId())
                .thenReturn(100L);

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("lab@medcore.com");

            ApiResponse<LabResultResponse> result =
                    labResultService.createResult(
                            10L,
                            request
                    );

            assertTrue(result.isSuccess());

            assertEquals(
                    "Lab result created successfully",
                    result.getMessage()
            );

            assertEquals(
                    response,
                    result.getData()
            );
        }

        verify(labResultRepository)
                .save(labResult);

        verify(labOrder)
                .setStatus(LabOrderStatus.COMPLETED);

        verify(labOrderRepository)
                .save(labOrder);

        verify(tenantCacheEvictService, times(2))
                .evictLabOrders();

        verify(
                labResultRepository,
                times(2)
        ).existsByLabOrderItemIdAndDeletedAtIsNull(10L);
    }


    @Test
    void createResult_shouldCreateSuccessfullyWhenResultsArePending() {

        CreateLabResultRequest request =
                createRequest();

        mockCurrentUser("lab@medcore.com");
        mockLabTechnician();
        mockLabOrderItem();
        mockHospital(1L, 1L);

        when(labOrder.getStatus())
                .thenReturn(LabOrderStatus.PROCESSING);

        when(labResultRepository
                .existsByLabOrderItemIdAndDeletedAtIsNull(10L))
                .thenReturn(false)
                .thenReturn(false);

        when(labResultMapper.toEntity(
                request,
                orderItem
        )).thenReturn(labResult);

        when(labResultRepository.save(labResult))
                .thenReturn(labResult);

        when(labOrder.getId())
                .thenReturn(20L);

        when(orderItem.getId())
                .thenReturn(10L);

        when(labOrderItemRepository
                .findByLabOrderIdAndDeletedAtIsNull(20L))
                .thenReturn(List.of(orderItem));

        when(labResultMapper.toResponse(labResult))
                .thenReturn(response);

        when(user.getId())
                .thenReturn(100L);

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("lab@medcore.com");

            ApiResponse<LabResultResponse> result =
                    labResultService.createResult(
                            10L,
                            request
                    );

            assertTrue(result.isSuccess());

            assertEquals(
                    "Lab result created successfully",
                    result.getMessage()
            );
        }

        verify(labResultRepository)
                .save(labResult);

        verify(labOrderRepository, never())
                .save(labOrder);

        verify(labOrder, never())
                .setStatus(LabOrderStatus.COMPLETED);

        verify(tenantCacheEvictService)
                .evictLabOrders();
    }


    @Test
    void createResult_shouldThrowWhenCurrentUserNotFound() {

        CreateLabResultRequest request =
                createRequest();

        when(userRepository.findByEmail("lab@medcore.com"))
                .thenReturn(Optional.empty());

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("lab@medcore.com");

            assertThrows(
                    ResourceNotFoundException.class,
                    () -> labResultService.createResult(
                            10L,
                            request
                    )
            );
        }

        verifyNoInteractions(labOrderItemRepository);
        verifyNoInteractions(labResultRepository);
    }


    @Test
    void createResult_shouldRejectNonLabTechnician() {

        CreateLabResultRequest request =
                createRequest();

        mockCurrentUser("doctor@medcore.com");
        mockDoctorRole();

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("doctor@medcore.com");

            assertThrows(
                    BusinessException.class,
                    () -> labResultService.createResult(
                            10L,
                            request
                    )
            );
        }

        verifyNoInteractions(labOrderItemRepository);
        verifyNoInteractions(labResultRepository);
    }


    @Test
    void createResult_shouldRejectNullRole() {

        CreateLabResultRequest request =
                createRequest();

        mockCurrentUser("user@medcore.com");

        when(user.getRole())
                .thenReturn(null);

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("user@medcore.com");

            assertThrows(
                    BusinessException.class,
                    () -> labResultService.createResult(
                            10L,
                            request
                    )
            );
        }

        verifyNoInteractions(labOrderItemRepository);
    }


    @Test
    void createResult_shouldThrowWhenItemNotFound() {

        CreateLabResultRequest request =
                createRequest();

        mockCurrentUser("lab@medcore.com");
        mockLabTechnician();

        when(labOrderItemRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.empty());

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("lab@medcore.com");

            assertThrows(
                    ResourceNotFoundException.class,
                    () -> labResultService.createResult(
                            10L,
                            request
                    )
            );
        }

        verifyNoInteractions(labResultRepository);
    }


    @Test
    void createResult_shouldRejectItemWithoutLabOrder() {

        CreateLabResultRequest request =
                createRequest();

        mockCurrentUser("lab@medcore.com");
        mockLabTechnician();

        when(labOrderItemRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(orderItem));

        when(orderItem.getLabOrder())
                .thenReturn(null);

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("lab@medcore.com");

            assertThrows(
                    BusinessException.class,
                    () -> labResultService.createResult(
                            10L,
                            request
                    )
            );
        }

        verifyNoInteractions(labResultRepository);
    }


    @Test
    void createResult_shouldRejectWrongHospital() {

        CreateLabResultRequest request =
                createRequest();

        mockCurrentUser("lab@medcore.com");
        mockLabTechnician();
        mockLabOrderItem();
        mockHospital(1L, 2L);

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("lab@medcore.com");

            assertThrows(
                    BusinessException.class,
                    () -> labResultService.createResult(
                            10L,
                            request
                    )
            );
        }

        verifyNoInteractions(labResultRepository);
    }


    @Test
    void createResult_shouldRejectNullHospitalForTenantUser() {

        CreateLabResultRequest request =
                createRequest();

        mockCurrentUser("lab@medcore.com");
        mockLabTechnician();
        mockLabOrderItem();

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(labOrder.getHospital())
                .thenReturn(null);

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("lab@medcore.com");

            assertThrows(
                    BusinessException.class,
                    () -> labResultService.createResult(
                            10L,
                            request
                    )
            );
        }

        verifyNoInteractions(labResultRepository);
    }


    @Test
    void createResult_shouldRejectNonProcessingOrder() {

        CreateLabResultRequest request =
                createRequest();

        mockCurrentUser("lab@medcore.com");
        mockLabTechnician();
        mockLabOrderItem();
        mockHospital(1L, 1L);

        when(labOrder.getStatus())
                .thenReturn(LabOrderStatus.ORDERED);

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("lab@medcore.com");

            assertThrows(
                    BusinessException.class,
                    () -> labResultService.createResult(
                            10L,
                            request
                    )
            );
        }

        verifyNoInteractions(labResultRepository);
    }


    @Test
    void createResult_shouldRejectDuplicateResult() {

        CreateLabResultRequest request =
                createRequest();

        mockCurrentUser("lab@medcore.com");
        mockLabTechnician();
        mockLabOrderItem();
        mockHospital(1L, 1L);

        when(labOrder.getStatus())
                .thenReturn(LabOrderStatus.PROCESSING);

        when(labResultRepository
                .existsByLabOrderItemIdAndDeletedAtIsNull(10L))
                .thenReturn(true);

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("lab@medcore.com");

            assertThrows(
                    BusinessException.class,
                    () -> labResultService.createResult(
                            10L,
                            request
                    )
            );
        }

        verify(
                labResultRepository,
                never()
        ).save(any());

        verifyNoInteractions(tenantCacheEvictService);
    }


    // ============================================================
    // GET RESULT
    // ============================================================

    @Test
    void getResult_shouldReturnResultForDoctor() {

        mockCurrentUser("doctor@medcore.com");
        mockDoctorRole();

        when(user.getId())
                .thenReturn(100L);

        mockLabOrderItem();
        mockHospital(1L, 1L);

        when(labOrder.getDoctor())
                .thenReturn(doctor);

        when(doctor.getId())
                .thenReturn(50L);

        when(doctorRepository
                .findByUserIdAndDeletedAtIsNull(100L))
                .thenReturn(Optional.of(doctor));

        when(labResultRepository
                .findByLabOrderItemIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(labResult));

        when(labResultMapper.toResponse(labResult))
                .thenReturn(response);

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("doctor@medcore.com");

            ApiResponse<LabResultResponse> result =
                    labResultService.getResult(10L);

            assertTrue(result.isSuccess());

            assertEquals(
                    "Lab result fetched successfully",
                    result.getMessage()
            );

            assertEquals(
                    response,
                    result.getData()
            );
        }

        verify(labResultMapper)
                .toResponse(labResult);
    }


    @Test
    void getResult_shouldReturnResultForPatient() {

        mockCurrentUser("patient@medcore.com");
        mockPatientRole();

        when(user.getId())
                .thenReturn(200L);

        mockLabOrderItem();
        mockHospital(1L, 1L);

        when(labOrder.getPatient())
                .thenReturn(patient);

        when(patient.getId())
                .thenReturn(300L);

        when(patientRepository
                .findByUserIdAndHospitalIdAndDeletedAtIsNull(
                        200L,
                        1L
                ))
                .thenReturn(Optional.of(patient));

        when(labResultRepository
                .findByLabOrderItemIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(labResult));

        when(labResultMapper.toResponse(labResult))
                .thenReturn(response);

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("patient@medcore.com");

            ApiResponse<LabResultResponse> result =
                    labResultService.getResult(10L);

            assertTrue(result.isSuccess());

            assertEquals(
                    "Lab result fetched successfully",
                    result.getMessage()
            );

            assertEquals(
                    response,
                    result.getData()
            );
        }
    }


    @Test
    void getResult_shouldReturnResultForLabTechnician() {

        mockCurrentUser("lab@medcore.com");
        mockLabTechnician();

        mockLabOrderItem();
        mockHospital(1L, 1L);

        when(labResultRepository
                .findByLabOrderItemIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(labResult));

        when(labResultMapper.toResponse(labResult))
                .thenReturn(response);

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("lab@medcore.com");

            ApiResponse<LabResultResponse> result =
                    labResultService.getResult(10L);

            assertTrue(result.isSuccess());

            assertEquals(
                    response,
                    result.getData()
            );
        }

        verifyNoInteractions(doctorRepository);
        verifyNoInteractions(patientRepository);
    }


    @Test
    void getResult_shouldReturnResultForSuperAdminWithoutHospitalContext() {

        mockCurrentUser("admin@medcore.com");
        mockSuperAdminRole();

        mockLabOrderItem();

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(null);

        when(labResultRepository
                .findByLabOrderItemIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(labResult));

        when(labResultMapper.toResponse(labResult))
                .thenReturn(response);

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("admin@medcore.com");

            ApiResponse<LabResultResponse> result =
                    labResultService.getResult(10L);

            assertTrue(result.isSuccess());

            assertEquals(
                    response,
                    result.getData()
            );
        }

        verifyNoInteractions(doctorRepository);
        verifyNoInteractions(patientRepository);
    }


    @Test
    void getResult_shouldRejectNonSuperAdminWithoutHospitalContext() {

        mockCurrentUser("lab@medcore.com");
        mockLabTechnician();
        mockLabOrderItem();

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(null);

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("lab@medcore.com");

            assertThrows(
                    BusinessException.class,
                    () -> labResultService.getResult(10L)
            );
        }

        verifyNoInteractions(labResultRepository);
    }


    @Test
    void getResult_shouldThrowWhenCurrentUserNotFound() {

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.empty());

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("doctor@medcore.com");

            assertThrows(
                    ResourceNotFoundException.class,
                    () -> labResultService.getResult(10L)
            );
        }

        verifyNoInteractions(labOrderItemRepository);
        verifyNoInteractions(labResultRepository);
    }


    @Test
    void getResult_shouldThrowWhenItemNotFound() {

        mockCurrentUser("doctor@medcore.com");

        when(labOrderItemRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.empty());

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("doctor@medcore.com");

            assertThrows(
                    ResourceNotFoundException.class,
                    () -> labResultService.getResult(10L)
            );
        }

        verifyNoInteractions(labResultRepository);
    }


    @Test
    void getResult_shouldRejectItemWithoutLabOrder() {

        mockCurrentUser("doctor@medcore.com");

        when(labOrderItemRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(orderItem));

        when(orderItem.getLabOrder())
                .thenReturn(null);

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("doctor@medcore.com");

            assertThrows(
                    BusinessException.class,
                    () -> labResultService.getResult(10L)
            );
        }

        verifyNoInteractions(labResultRepository);
    }


    @Test
    void getResult_shouldRejectWrongHospital() {

        mockCurrentUser("doctor@medcore.com");

        mockLabOrderItem();
        mockHospital(1L, 2L);

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("doctor@medcore.com");

            assertThrows(
                    BusinessException.class,
                    () -> labResultService.getResult(10L)
            );
        }

        verifyNoInteractions(doctorRepository);
        verifyNoInteractions(patientRepository);
        verifyNoInteractions(labResultRepository);
    }


    @Test
    void getResult_shouldRejectDoctorWhoDoesNotOwnOrder() {

        mockCurrentUser("doctor@medcore.com");
        mockDoctorRole();

        when(user.getId())
                .thenReturn(100L);

        mockLabOrderItem();
        mockHospital(1L, 1L);

        when(labOrder.getDoctor())
                .thenReturn(doctor);

        when(doctor.getId())
                .thenReturn(50L);

        Doctor anotherDoctor =
                mock(Doctor.class);

        when(anotherDoctor.getId())
                .thenReturn(99L);

        when(doctorRepository
                .findByUserIdAndDeletedAtIsNull(100L))
                .thenReturn(Optional.of(anotherDoctor));

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("doctor@medcore.com");

            assertThrows(
                    BusinessException.class,
                    () -> labResultService.getResult(10L)
            );
        }

        verifyNoInteractions(labResultRepository);
    }


    @Test
    void getResult_shouldRejectDoctorWhenDoctorProfileNotFound() {

    mockCurrentUser("doctor@medcore.com");
    mockDoctorRole();

    when(user.getId())
            .thenReturn(100L);

    mockLabOrderItem();
    mockHospital(1L, 1L);

    when(doctorRepository
            .findByUserIdAndDeletedAtIsNull(100L))
            .thenReturn(Optional.empty());

    try (MockedStatic<SecurityUtil> securityMock =
                 mockStatic(SecurityUtil.class)) {

        securityMock
                .when(SecurityUtil::getCurrentUsername)
                .thenReturn("doctor@medcore.com");

        assertThrows(
                BusinessException.class,
                () -> labResultService.getResult(10L)
        );
    }

    verifyNoInteractions(labResultRepository);
}


    @Test
    void getResult_shouldRejectPatientWhoDoesNotOwnOrder() {

        mockCurrentUser("patient@medcore.com");
        mockPatientRole();

        when(user.getId())
                .thenReturn(200L);

        mockLabOrderItem();
        mockHospital(1L, 1L);

        when(labOrder.getPatient())
                .thenReturn(patient);

        when(patient.getId())
                .thenReturn(300L);

        Patient anotherPatient =
                mock(Patient.class);

        when(anotherPatient.getId())
                .thenReturn(999L);

        when(patientRepository
                .findByUserIdAndHospitalIdAndDeletedAtIsNull(
                        200L,
                        1L
                ))
                .thenReturn(Optional.of(anotherPatient));

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("patient@medcore.com");

            assertThrows(
                    BusinessException.class,
                    () -> labResultService.getResult(10L)
            );
        }

        verifyNoInteractions(labResultRepository);
    }


    @Test
    void getResult_shouldRejectPatientWhenPatientProfileNotFound() {

    mockCurrentUser("patient@medcore.com");
    mockPatientRole();

    when(user.getId())
            .thenReturn(200L);

    mockLabOrderItem();
    mockHospital(1L, 1L);

    when(patientRepository
            .findByUserIdAndHospitalIdAndDeletedAtIsNull(
                    200L,
                    1L
            ))
            .thenReturn(Optional.empty());

    try (MockedStatic<SecurityUtil> securityMock =
                 mockStatic(SecurityUtil.class)) {

        securityMock
                .when(SecurityUtil::getCurrentUsername)
                .thenReturn("patient@medcore.com");

        assertThrows(
                BusinessException.class,
                () -> labResultService.getResult(10L)
        );
    }

    verifyNoInteractions(labResultRepository);
}


    @Test
    void getResult_shouldRejectUnauthorizedUser() {

        mockCurrentUser("user@medcore.com");

        when(user.getRole())
                .thenReturn(role);

        when(role.getName())
                .thenReturn(RoleName.RECEPTIONIST);

        mockLabOrderItem();
        mockHospital(1L, 1L);

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("user@medcore.com");

            assertThrows(
                    BusinessException.class,
                    () -> labResultService.getResult(10L)
            );
        }

        verifyNoInteractions(labResultRepository);
        verifyNoInteractions(doctorRepository);
        verifyNoInteractions(patientRepository);
    }


    @Test
    void getResult_shouldThrowWhenResultNotFound() {

        mockCurrentUser("doctor@medcore.com");
        mockDoctorRole();

        when(user.getId())
                .thenReturn(100L);

        mockLabOrderItem();
        mockHospital(1L, 1L);

        when(labOrder.getDoctor())
                .thenReturn(doctor);

        when(doctor.getId())
                .thenReturn(50L);

        when(doctorRepository
                .findByUserIdAndDeletedAtIsNull(100L))
                .thenReturn(Optional.of(doctor));

        when(labResultRepository
                .findByLabOrderItemIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.empty());

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("doctor@medcore.com");

            assertThrows(
                    ResourceNotFoundException.class,
                    () -> labResultService.getResult(10L)
            );
        }
    }


       
    @Test
    void updateResult_shouldUpdateSuccessfully() {

        CreateLabResultRequest request =
                createRequest();

        request.setResultValue("150");
        request.setRemarks("Updated");

        mockCurrentUser("lab@medcore.com");
        mockLabTechnician();
        mockLabOrderItem();
        mockHospital(1L, 1L);

        when(labOrder.getStatus())
                .thenReturn(LabOrderStatus.PROCESSING);

        when(labResultRepository
                .findByLabOrderItemIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(labResult));

        when(labResultRepository.save(labResult))
                .thenReturn(labResult);

        when(labResultMapper.toResponse(labResult))
                .thenReturn(response);

        when(user.getId())
                .thenReturn(100L);

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("lab@medcore.com");

            ApiResponse<LabResultResponse> result =
                    labResultService.updateResult(
                            10L,
                            request
                    );

            assertTrue(result.isSuccess());

            assertEquals(
                    "Lab result updated successfully",
                    result.getMessage()
            );

            assertEquals(
                    response,
                    result.getData()
            );
        }

        verify(labResult)
                .setResultValue("150");

        verify(labResult)
                .setUnit("mg/dL");

        verify(labResult)
                .setReferenceRange("70-100");

        verify(labResult)
                .setRemarks("Updated");

        verify(labResult)
                .setAbnormal(true);

        verify(labResult)
                .setResultDate(any());

        verify(labResultRepository)
                .save(labResult);

        verify(tenantCacheEvictService)
                .evictLabOrders();
    }


    @Test
    void updateResult_shouldSetAbnormalFalseWhenRequestAbnormalIsNull() {

        CreateLabResultRequest request =
                createRequest();

        request.setResultValue("150");
        request.setRemarks("Updated");
        request.setAbnormal(null);

        mockCurrentUser("lab@medcore.com");
        mockLabTechnician();
        mockLabOrderItem();
        mockHospital(1L, 1L);

        when(labOrder.getStatus())
                .thenReturn(LabOrderStatus.PROCESSING);

        when(labResultRepository
                .findByLabOrderItemIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(labResult));

        when(labResultRepository.save(labResult))
                .thenReturn(labResult);

        when(labResultMapper.toResponse(labResult))
                .thenReturn(response);

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("lab@medcore.com");

            ApiResponse<LabResultResponse> result =
                    labResultService.updateResult(
                            10L,
                            request
                    );

            assertTrue(result.isSuccess());
        }

        verify(labResult)
                .setAbnormal(false);

        verify(labResultRepository)
                .save(labResult);
    }


    @Test
    void updateResult_shouldRejectNonLabTechnician() {

        CreateLabResultRequest request =
                createRequest();

        mockCurrentUser("doctor@medcore.com");
        mockDoctorRole();

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("doctor@medcore.com");

            assertThrows(
                    BusinessException.class,
                    () -> labResultService.updateResult(
                            10L,
                            request
                    )
            );
        }

        verifyNoInteractions(labOrderItemRepository);
        verifyNoInteractions(labResultRepository);
    }


    @Test
    void updateResult_shouldThrowWhenCurrentUserNotFound() {

        CreateLabResultRequest request =
                createRequest();

        when(userRepository.findByEmail("lab@medcore.com"))
                .thenReturn(Optional.empty());

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("lab@medcore.com");

            assertThrows(
                    ResourceNotFoundException.class,
                    () -> labResultService.updateResult(
                            10L,
                            request
                    )
            );
        }

        verifyNoInteractions(labOrderItemRepository);
        verifyNoInteractions(labResultRepository);
    }


    @Test
    void updateResult_shouldThrowWhenItemNotFound() {

        CreateLabResultRequest request =
                createRequest();

        mockCurrentUser("lab@medcore.com");
        mockLabTechnician();

        when(labOrderItemRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.empty());

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("lab@medcore.com");

            assertThrows(
                    ResourceNotFoundException.class,
                    () -> labResultService.updateResult(
                            10L,
                            request
                    )
            );
        }

        verifyNoInteractions(labResultRepository);
    }


    @Test
    void updateResult_shouldRejectItemWithoutLabOrder() {

        CreateLabResultRequest request =
                createRequest();

        mockCurrentUser("lab@medcore.com");
        mockLabTechnician();

        when(labOrderItemRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(orderItem));

        when(orderItem.getLabOrder())
                .thenReturn(null);

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("lab@medcore.com");

            assertThrows(
                    BusinessException.class,
                    () -> labResultService.updateResult(
                            10L,
                            request
                    )
            );
        }

        verifyNoInteractions(labResultRepository);
    }


    @Test
    void updateResult_shouldRejectWrongHospital() {

        CreateLabResultRequest request =
                createRequest();

        mockCurrentUser("lab@medcore.com");
        mockLabTechnician();
        mockLabOrderItem();
        mockHospital(1L, 2L);

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("lab@medcore.com");

            assertThrows(
                    BusinessException.class,
                    () -> labResultService.updateResult(
                            10L,
                            request
                    )
            );
        }

        verifyNoInteractions(labResultRepository);
    }


    @Test
    void updateResult_shouldRejectNullHospitalForTenantUser() {

        CreateLabResultRequest request =
                createRequest();

        mockCurrentUser("lab@medcore.com");
        mockLabTechnician();
        mockLabOrderItem();

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(labOrder.getHospital())
                .thenReturn(null);

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("lab@medcore.com");

            assertThrows(
                    BusinessException.class,
                    () -> labResultService.updateResult(
                            10L,
                            request
                    )
            );
        }

        verifyNoInteractions(labResultRepository);
    }


    @Test
    void updateResult_shouldRejectNonProcessingOrder() {

        CreateLabResultRequest request =
                createRequest();

        mockCurrentUser("lab@medcore.com");
        mockLabTechnician();
        mockLabOrderItem();
        mockHospital(1L, 1L);

        when(labOrder.getStatus())
                .thenReturn(LabOrderStatus.COMPLETED);

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("lab@medcore.com");

            assertThrows(
                    BusinessException.class,
                    () -> labResultService.updateResult(
                            10L,
                            request
                    )
            );
        }

        verifyNoInteractions(labResultRepository);
    }


    @Test
    void updateResult_shouldThrowWhenResultNotFound() {

        CreateLabResultRequest request =
                createRequest();

        mockCurrentUser("lab@medcore.com");
        mockLabTechnician();
        mockLabOrderItem();
        mockHospital(1L, 1L);

        when(labOrder.getStatus())
                .thenReturn(LabOrderStatus.PROCESSING);

        when(labResultRepository
                .findByLabOrderItemIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.empty());

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("lab@medcore.com");

            assertThrows(
                    ResourceNotFoundException.class,
                    () -> labResultService.updateResult(
                            10L,
                            request
                    )
            );
        }

        verify(
                labResultRepository,
                never()
        ).save(any());

        verifyNoInteractions(tenantCacheEvictService);
    }
}