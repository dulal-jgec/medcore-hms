package com.medcore.features.lab.service.impl;

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

import com.medcore.features.user.entity.User;
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
import static org.mockito.ArgumentMatchers.*;
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

    @InjectMocks
    private LabResultServiceImpl labResultService;

    private User user;
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
    // CREATE RESULT
    // ============================================================

    @Test
    void createResult_shouldCreateSuccessfully() {

        CreateLabResultRequest request =
                new CreateLabResultRequest();

        request.setResultValue("120");
        request.setUnit("mg/dL");
        request.setReferenceRange("70-100");
        request.setRemarks("Slightly high");
        request.setAbnormal(true);

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

        // IMPORTANT: service first searches the LabOrderItem by ID
        when(labOrderItemRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(orderItem));

        when(orderItem.getLabOrder())
                .thenReturn(labOrder);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(labOrder.getHospital())
                .thenReturn(hospital);

        when(hospital.getId())
                .thenReturn(1L);

        when(labOrder.getStatus())
                .thenReturn(LabOrderStatus.PROCESSING);

        when(labResultRepository
                .existsByLabOrderItemIdAndDeletedAtIsNull(10L))
                .thenReturn(false)
                .thenReturn(true);

        when(labResultMapper.toEntity(
                request,
                orderItem
        ))
                .thenReturn(labResult);

        when(labResultRepository.save(labResult))
                .thenReturn(labResult);

        when(labOrder.getId())
                .thenReturn(20L);

        when(labOrderItemRepository
                .findByLabOrderIdAndDeletedAtIsNull(20L))
                .thenReturn(List.of(orderItem));

        when(orderItem.getId())
                .thenReturn(10L);

        when(labResultMapper.toResponse(labResult))
                .thenReturn(response);

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("doctor@medcore.com");

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
    }


    @Test
    void createResult_shouldThrowWhenItemNotFound() {

        CreateLabResultRequest request =
                new CreateLabResultRequest();

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

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
                    () -> labResultService.createResult(
                            10L,
                            request
                    )
            );
        }

        verifyNoInteractions(labResultRepository);
    }


    @Test
    void createResult_shouldThrowWhenCurrentUserNotFound() {

        CreateLabResultRequest request =
                new CreateLabResultRequest();

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.empty());

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("doctor@medcore.com");

            assertThrows(
                    ResourceNotFoundException.class,
                    () -> labResultService.createResult(
                            10L,
                            request
                    )
            );
        }

        verifyNoInteractions(labOrderItemRepository);
    }


    @Test
    void createResult_shouldRejectWrongHospital() {

        CreateLabResultRequest request =
                new CreateLabResultRequest();

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

        when(labOrderItemRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(orderItem));

        when(orderItem.getLabOrder())
                .thenReturn(labOrder);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(labOrder.getHospital())
                .thenReturn(hospital);

        when(hospital.getId())
                .thenReturn(2L);

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

        verifyNoInteractions(labResultRepository);
    }


    @Test
    void createResult_shouldRejectNonProcessingOrder() {

        CreateLabResultRequest request =
                new CreateLabResultRequest();

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

        when(labOrderItemRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(orderItem));

        when(orderItem.getLabOrder())
                .thenReturn(labOrder);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(labOrder.getHospital())
                .thenReturn(hospital);

        when(hospital.getId())
                .thenReturn(1L);

        when(labOrder.getStatus())
                .thenReturn(LabOrderStatus.ORDERED);

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

        verifyNoInteractions(labResultRepository);
    }


    @Test
    void createResult_shouldRejectDuplicateResult() {

        CreateLabResultRequest request =
                new CreateLabResultRequest();

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

        when(labOrderItemRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(orderItem));

        when(orderItem.getLabOrder())
                .thenReturn(labOrder);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(labOrder.getHospital())
                .thenReturn(hospital);

        when(hospital.getId())
                .thenReturn(1L);

        when(labOrder.getStatus())
                .thenReturn(LabOrderStatus.PROCESSING);

        when(labResultRepository
                .existsByLabOrderItemIdAndDeletedAtIsNull(10L))
                .thenReturn(true);

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

        verify(labResultRepository, never())
                .save(any());
    }


    @Test
    void createResult_shouldNotCompleteOrderWhenResultsArePending() {

        CreateLabResultRequest request =
                new CreateLabResultRequest();

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

        when(labOrderItemRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(orderItem));

        when(orderItem.getLabOrder())
                .thenReturn(labOrder);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(labOrder.getHospital())
                .thenReturn(hospital);

        when(hospital.getId())
                .thenReturn(1L);

        when(labOrder.getStatus())
                .thenReturn(LabOrderStatus.PROCESSING);

        when(labResultRepository
                .existsByLabOrderItemIdAndDeletedAtIsNull(10L))
                .thenReturn(false)
                .thenReturn(false);

        when(labResultMapper.toEntity(request, orderItem))
                .thenReturn(labResult);

        when(labResultRepository.save(labResult))
                .thenReturn(labResult);

        when(labOrder.getId())
                .thenReturn(20L);

        when(labOrderItemRepository
                .findByLabOrderIdAndDeletedAtIsNull(20L))
                .thenReturn(List.of(orderItem));

        when(orderItem.getId())
                .thenReturn(10L);

        when(labResultMapper.toResponse(labResult))
                .thenReturn(response);

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("doctor@medcore.com");

            ApiResponse<LabResultResponse> result =
                    labResultService.createResult(
                            10L,
                            request
                    );

            assertTrue(result.isSuccess());
        }

        verify(labOrderRepository, never())
                .save(labOrder);
    }


    // ============================================================
    // GET RESULT
    // ============================================================

    @Test
    void getResult_shouldReturnResultForDoctor() {

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

        when(user.getId())
                .thenReturn(100L);

        when(labOrderItemRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(orderItem));

        when(orderItem.getLabOrder())
                .thenReturn(labOrder);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(labOrder.getHospital())
                .thenReturn(hospital);

        when(hospital.getId())
                .thenReturn(1L);

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
    }


    @Test
    void getResult_shouldReturnResultForPatient() {

        when(userRepository.findByEmail("patient@medcore.com"))
                .thenReturn(Optional.of(user));

        when(user.getId())
                .thenReturn(200L);

        when(labOrderItemRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(orderItem));

        when(orderItem.getLabOrder())
                .thenReturn(labOrder);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(labOrder.getHospital())
                .thenReturn(hospital);

        when(hospital.getId())
                .thenReturn(1L);

        when(labOrder.getDoctor())
                .thenReturn(null);

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
                    response,
                    result.getData()
            );
        }
    }


    @Test
    void getResult_shouldRejectUnauthorizedUser() {

        when(userRepository.findByEmail("user@medcore.com"))
                .thenReturn(Optional.of(user));

        when(user.getId())
                .thenReturn(500L);

        when(labOrderItemRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(orderItem));

        when(orderItem.getLabOrder())
                .thenReturn(labOrder);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(labOrder.getHospital())
                .thenReturn(hospital);

        when(hospital.getId())
                .thenReturn(1L);

        when(labOrder.getDoctor())
                .thenReturn(doctor);

         

        when(doctorRepository
                .findByUserIdAndDeletedAtIsNull(500L))
                .thenReturn(Optional.empty());

        when(labOrder.getPatient())
                .thenReturn(patient);

        when(patientRepository
                .findByUserIdAndHospitalIdAndDeletedAtIsNull(
                        500L,
                        1L
                ))
                .thenReturn(Optional.empty());

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
    }


    @Test
    void getResult_shouldThrowWhenItemNotFound() {

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

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
    }


    @Test
    void getResult_shouldThrowWhenWrongHospital() {

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

        when(labOrderItemRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(orderItem));

        when(orderItem.getLabOrder())
                .thenReturn(labOrder);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(labOrder.getHospital())
                .thenReturn(hospital);

        when(hospital.getId())
                .thenReturn(2L);

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
    }


    @Test
    void getResult_shouldThrowWhenResultNotFound() {

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

        when(user.getId())
                .thenReturn(100L);

        when(labOrderItemRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(orderItem));

        when(orderItem.getLabOrder())
                .thenReturn(labOrder);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(labOrder.getHospital())
                .thenReturn(hospital);

        when(hospital.getId())
                .thenReturn(1L);

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


    // ============================================================
    // UPDATE RESULT
    // ============================================================

    @Test
    void updateResult_shouldUpdateSuccessfully() {

        CreateLabResultRequest request =
                new CreateLabResultRequest();

        request.setResultValue("150");
        request.setUnit("mg/dL");
        request.setReferenceRange("70-100");
        request.setRemarks("Updated");
        request.setAbnormal(true);

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

        when(labOrderItemRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(orderItem));

        when(orderItem.getLabOrder())
                .thenReturn(labOrder);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(labOrder.getHospital())
                .thenReturn(hospital);

        when(hospital.getId())
                .thenReturn(1L);

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
                    .thenReturn("doctor@medcore.com");

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
    }


    @Test
    void updateResult_shouldThrowWhenItemNotFound() {

        CreateLabResultRequest request =
                new CreateLabResultRequest();

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

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
                new CreateLabResultRequest();

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

        when(labOrderItemRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(orderItem));

        when(orderItem.getLabOrder())
                .thenReturn(labOrder);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(labOrder.getHospital())
                .thenReturn(hospital);

        when(hospital.getId())
                .thenReturn(2L);

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

        verifyNoInteractions(labResultRepository);
    }


    @Test
    void updateResult_shouldRejectNonProcessingOrder() {

        CreateLabResultRequest request =
                new CreateLabResultRequest();

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

        when(labOrderItemRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(orderItem));

        when(orderItem.getLabOrder())
                .thenReturn(labOrder);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(labOrder.getHospital())
                .thenReturn(hospital);

        when(hospital.getId())
                .thenReturn(1L);

        when(labOrder.getStatus())
                .thenReturn(LabOrderStatus.COMPLETED);

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

        verifyNoInteractions(labResultRepository);
    }


    @Test
    void updateResult_shouldThrowWhenResultNotFound() {

        CreateLabResultRequest request =
                new CreateLabResultRequest();

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

        when(labOrderItemRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(orderItem));

        when(orderItem.getLabOrder())
                .thenReturn(labOrder);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(labOrder.getHospital())
                .thenReturn(hospital);

        when(hospital.getId())
                .thenReturn(1L);

        when(labOrder.getStatus())
                .thenReturn(LabOrderStatus.PROCESSING);

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
                    () -> labResultService.updateResult(
                            10L,
                            request
                    )
            );
        }

        verify(labResultRepository, never())
                .save(any());
    }


    @Test
    void createResult_shouldRejectNullHospitalForTenantUser() {

        CreateLabResultRequest request =
                new CreateLabResultRequest();

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

        when(labOrderItemRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(orderItem));

        when(orderItem.getLabOrder())
                .thenReturn(labOrder);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(labOrder.getHospital())
                .thenReturn(null);

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

        verifyNoInteractions(labResultRepository);
    }
}