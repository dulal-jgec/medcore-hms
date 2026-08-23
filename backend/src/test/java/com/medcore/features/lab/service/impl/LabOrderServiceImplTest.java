package com.medcore.features.lab.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.security.SecurityUtil;
import com.medcore.common.security.TenantContextService;

import com.medcore.features.appointment.entity.Appointment;
import com.medcore.features.appointment.enums.AppointmentStatus;
import com.medcore.features.appointment.repository.AppointmentRepository;

import com.medcore.features.doctor.entity.Doctor;
import com.medcore.features.doctor.repository.DoctorRepository;

import com.medcore.features.hospital.entity.Hospital;

import com.medcore.features.lab.dto.request.AddLabOrderItemRequest;
import com.medcore.features.lab.dto.request.CreateLabOrderRequest;
import com.medcore.features.lab.dto.response.LabOrderItemResponse;
import com.medcore.features.lab.dto.response.LabOrderResponse;

import com.medcore.features.lab.entity.LabOrder;
import com.medcore.features.lab.entity.LabOrderItem;
import com.medcore.features.lab.entity.LabTest;

import com.medcore.features.lab.enums.LabOrderStatus;

import com.medcore.features.lab.mapper.LabOrderItemMapper;
import com.medcore.features.lab.mapper.LabOrderMapper;

import com.medcore.features.lab.repository.LabOrderItemRepository;
import com.medcore.features.lab.repository.LabOrderRepository;
import com.medcore.features.lab.repository.LabTestRepository;

import com.medcore.features.patient.entity.Patient;

import com.medcore.features.user.entity.User;
import com.medcore.features.user.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import com.medcore.features.notification.enums.NotificationType;
import com.medcore.features.notification.service.NotificationService;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import com.medcore.common.cache.TenantCacheEvictService;
@ExtendWith(MockitoExtension.class)
class LabOrderServiceImplTest {

    @Mock
    private LabOrderRepository labOrderRepository;

    @Mock
    private LabOrderItemRepository labOrderItemRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private LabTestRepository labTestRepository;

    @Mock
    private LabOrderMapper labOrderMapper;

    @Mock
    private LabOrderItemMapper labOrderItemMapper;

    @Mock
    private TenantContextService tenantContextService;
    
    @Mock
    private TenantCacheEvictService tenantCacheEvictService;
    
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private LabOrderServiceImpl labOrderService;

    private User user;
    private Doctor doctor;
    private Appointment appointment;
    private LabOrder labOrder;
    private LabTest labTest;
    private LabOrderItem labOrderItem;
    private Hospital hospital;
    private Patient patient;

    private LabOrderResponse orderResponse;
    private LabOrderItemResponse itemResponse;

    @BeforeEach
    void setUp() {

        user = mock(User.class);
        doctor = mock(Doctor.class);
        appointment = mock(Appointment.class);
        labOrder = mock(LabOrder.class);
        labTest = mock(LabTest.class);
        labOrderItem = mock(LabOrderItem.class);
        hospital = mock(Hospital.class);
        patient = mock(Patient.class);

        orderResponse = mock(LabOrderResponse.class);
        itemResponse = mock(LabOrderItemResponse.class);
    }

     

    @Test
    void createLabOrder_shouldCreateSuccessfully() {

        CreateLabOrderRequest request =
                mock(CreateLabOrderRequest.class);

        when(request.getAppointmentId())
                .thenReturn(10L);

        when(request.getLabTestIds())
                .thenReturn(List.of(100L, 101L));

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

        when(user.getId())
                .thenReturn(50L);

        when(doctorRepository
                .findByUserIdAndDeletedAtIsNull(50L))
                .thenReturn(Optional.of(doctor));

        when(appointmentRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(appointment));

        when(appointment.getHospital())
                .thenReturn(hospital);

        when(hospital.getId())
                .thenReturn(1L);

        when(appointment.getDoctor())
                .thenReturn(doctor);

        when(doctor.getId())
                .thenReturn(50L);

        when(appointment.getStatus())
                .thenReturn(AppointmentStatus.COMPLETED);

        when(appointment.getId())
                .thenReturn(10L);

        when(labOrderRepository
                .existsByAppointmentIdAndDeletedAtIsNull(10L))
                .thenReturn(false);

        when(appointment.getPatient())
        .thenReturn(patient);

        User patientUser = mock(User.class);

        when(patientUser.getId())
        .thenReturn(60L);

        when(patient.getUser())
        .thenReturn(patientUser);

        when(labOrderMapper.toEntity(
        request,
        appointment,
        doctor,
        patient,
        hospital
)).thenReturn(labOrder);

        when(labOrderRepository.save(labOrder))
                .thenReturn(labOrder);

        when(labTestRepository
                .findByIdAndDeletedAtIsNull(100L))
                .thenReturn(Optional.of(labTest));

        when(labTestRepository
                .findByIdAndDeletedAtIsNull(101L))
                .thenReturn(Optional.of(labTest));

        when(labOrderItemRepository
                .findByLabOrderIdAndDeletedAtIsNull(anyLong()))
                .thenReturn(List.of(labOrderItem));

        when(labOrder.getId())
                .thenReturn(500L);

        when(labOrderItemMapper.toResponse(labOrderItem))
                .thenReturn(itemResponse);

        when(labOrderMapper.toResponse(
                labOrder,
                List.of(itemResponse)
        )).thenReturn(orderResponse);

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("doctor@medcore.com");

            ApiResponse<LabOrderResponse> result =
                    labOrderService.createLabOrder(request);

            assertTrue(result.isSuccess());

            assertEquals(
                    "Lab order created successfully",
                    result.getMessage()
            );

            assertEquals(
                    orderResponse,
                    result.getData()
            );
        }

        verify(labOrderRepository).save(labOrder);

        verify(labOrderItemRepository, times(2))
                .save(any(LabOrderItem.class));
    }


    @Test
    void createLabOrder_shouldRejectNonDoctor() {

        CreateLabOrderRequest request =
                mock(CreateLabOrderRequest.class);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(userRepository.findByEmail("user@medcore.com"))
                .thenReturn(Optional.of(user));

        when(user.getId())
                .thenReturn(20L);

        when(doctorRepository
                .findByUserIdAndDeletedAtIsNull(20L))
                .thenReturn(Optional.empty());

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("user@medcore.com");

            assertThrows(
                    BusinessException.class,
                    () -> labOrderService.createLabOrder(request)
            );
        }

        verifyNoInteractions(appointmentRepository);
        verifyNoInteractions(labOrderRepository);
    }


    @Test
    void createLabOrder_shouldThrowWhenAppointmentNotFound() {

        CreateLabOrderRequest request =
                mock(CreateLabOrderRequest.class);

        when(request.getAppointmentId())
                .thenReturn(10L);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

        when(user.getId())
                .thenReturn(50L);

        when(doctorRepository
                .findByUserIdAndDeletedAtIsNull(50L))
                .thenReturn(Optional.of(doctor));

        when(appointmentRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.empty());

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("doctor@medcore.com");

            assertThrows(
                    ResourceNotFoundException.class,
                    () -> labOrderService.createLabOrder(request)
            );
        }

        verifyNoInteractions(labOrderRepository);
    }


    @Test
    void createLabOrder_shouldRejectWrongHospital() {

        CreateLabOrderRequest request =
                mock(CreateLabOrderRequest.class);

        when(request.getAppointmentId())
                .thenReturn(10L);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

        when(user.getId())
                .thenReturn(50L);

        when(doctorRepository
                .findByUserIdAndDeletedAtIsNull(50L))
                .thenReturn(Optional.of(doctor));

        when(appointmentRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(appointment));

        when(appointment.getHospital())
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
                    () -> labOrderService.createLabOrder(request)
            );
        }

        verifyNoInteractions(labOrderRepository);
    }


    @Test
    void createLabOrder_shouldRejectWrongDoctor() {

        CreateLabOrderRequest request =
                mock(CreateLabOrderRequest.class);

        Doctor appointmentDoctor =
                mock(Doctor.class);

        when(request.getAppointmentId())
                .thenReturn(10L);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

        when(user.getId())
                .thenReturn(50L);

        when(doctorRepository
                .findByUserIdAndDeletedAtIsNull(50L))
                .thenReturn(Optional.of(doctor));

        when(doctor.getId())
                .thenReturn(50L);

        when(appointmentRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(appointment));

        when(appointment.getHospital())
                .thenReturn(hospital);

        when(hospital.getId())
                .thenReturn(1L);

        when(appointment.getDoctor())
                .thenReturn(appointmentDoctor);

        when(appointmentDoctor.getId())
                .thenReturn(99L);

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("doctor@medcore.com");

            assertThrows(
                    BusinessException.class,
                    () -> labOrderService.createLabOrder(request)
            );
        }

        verifyNoInteractions(labOrderRepository);
    }


    @Test
    void createLabOrder_shouldRejectIncompleteAppointment() {

        CreateLabOrderRequest request =
                mock(CreateLabOrderRequest.class);

        when(request.getAppointmentId())
                .thenReturn(10L);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

        when(user.getId())
                .thenReturn(50L);

        when(doctorRepository
                .findByUserIdAndDeletedAtIsNull(50L))
                .thenReturn(Optional.of(doctor));

        when(doctor.getId())
                .thenReturn(50L);

        when(appointmentRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(appointment));

        when(appointment.getHospital())
                .thenReturn(hospital);

        when(hospital.getId())
                .thenReturn(1L);

        when(appointment.getDoctor())
                .thenReturn(doctor);

        when(appointment.getStatus())
                .thenReturn(AppointmentStatus.SCHEDULED);

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("doctor@medcore.com");

            assertThrows(
                    BusinessException.class,
                    () -> labOrderService.createLabOrder(request)
            );
        }

        verifyNoInteractions(labOrderRepository);
    }


    @Test
    void createLabOrder_shouldRejectDuplicateOrder() {

        CreateLabOrderRequest request =
                mock(CreateLabOrderRequest.class);

        when(request.getAppointmentId())
                .thenReturn(10L);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

        when(user.getId())
                .thenReturn(50L);

        when(doctorRepository
                .findByUserIdAndDeletedAtIsNull(50L))
                .thenReturn(Optional.of(doctor));

        when(doctor.getId())
                .thenReturn(50L);

        when(appointmentRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(appointment));

        when(appointment.getHospital())
                .thenReturn(hospital);

        when(hospital.getId())
                .thenReturn(1L);

        when(appointment.getDoctor())
                .thenReturn(doctor);

        when(appointment.getStatus())
                .thenReturn(AppointmentStatus.COMPLETED);

        when(appointment.getId())
                .thenReturn(10L);

        when(labOrderRepository
                .existsByAppointmentIdAndDeletedAtIsNull(10L))
                .thenReturn(true);

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("doctor@medcore.com");

            assertThrows(
                    BusinessException.class,
                    () -> labOrderService.createLabOrder(request)
            );
        }

        verify(labOrderRepository, never())
                .save(any());
    }


    @Test
    void createLabOrder_shouldThrowWhenLabTestNotFound() {

        CreateLabOrderRequest request =
                mock(CreateLabOrderRequest.class);

        when(request.getAppointmentId())
                .thenReturn(10L);

        when(request.getLabTestIds())
                .thenReturn(List.of(100L));

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

        when(user.getId())
                .thenReturn(50L);

        when(doctorRepository
                .findByUserIdAndDeletedAtIsNull(50L))
                .thenReturn(Optional.of(doctor));

        when(doctor.getId())
                .thenReturn(50L);

        when(appointmentRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(appointment));

        when(appointment.getHospital())
                .thenReturn(hospital);

        when(hospital.getId())
                .thenReturn(1L);

        when(appointment.getDoctor())
                .thenReturn(doctor);

        when(appointment.getStatus())
                .thenReturn(AppointmentStatus.COMPLETED);

        when(appointment.getId())
                .thenReturn(10L);

        when(labOrderRepository
                .existsByAppointmentIdAndDeletedAtIsNull(10L))
                .thenReturn(false);

        when(appointment.getPatient())
                .thenReturn(patient);

        when(labOrderMapper.toEntity(
                request,
                appointment,
                doctor,
                patient,
                hospital
        )).thenReturn(labOrder);

        when(labOrderRepository.save(labOrder))
                .thenReturn(labOrder);

        when(labTestRepository
                .findByIdAndDeletedAtIsNull(100L))
                .thenReturn(Optional.empty());

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("doctor@medcore.com");

            assertThrows(
                    ResourceNotFoundException.class,
                    () -> labOrderService.createLabOrder(request)
            );
        }
    }


    // ============================================================
    // ADD LAB ORDER ITEM
    // ============================================================

    @Test
    void addLabOrderItem_shouldAddSuccessfully() {

        AddLabOrderItemRequest request =
                mock(AddLabOrderItemRequest.class);

        when(request.getLabTestId())
                .thenReturn(100L);

        when(request.getInstructions())
                .thenReturn("Fasting required");

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

        when(user.getId())
                .thenReturn(50L);

        when(doctorRepository
                .findByUserIdAndDeletedAtIsNull(50L))
                .thenReturn(Optional.of(doctor));

        when(doctor.getId())
                .thenReturn(50L);

        when(labOrderRepository
                .findByIdAndDeletedAtIsNull(500L))
                .thenReturn(Optional.of(labOrder));

        when(labOrder.getHospital())
                .thenReturn(hospital);

        when(hospital.getId())
                .thenReturn(1L);

        when(labOrder.getDoctor())
                .thenReturn(doctor);

        when(labOrder.getStatus())
                .thenReturn(LabOrderStatus.ORDERED);

        when(labOrderItemRepository
                .existsByLabOrderIdAndLabTestIdAndDeletedAtIsNull(
                        500L,
                        100L
                ))
                .thenReturn(false);

        when(labTestRepository
                .findByIdAndDeletedAtIsNull(100L))
                .thenReturn(Optional.of(labTest));

        when(labOrderItemRepository.save(any(LabOrderItem.class)))
                .thenReturn(labOrderItem);

        when(labOrderItemMapper.toResponse(labOrderItem))
                .thenReturn(itemResponse);

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("doctor@medcore.com");

            ApiResponse<LabOrderItemResponse> result =
                    labOrderService.addLabOrderItem(
                            500L,
                            request
                    );

            assertTrue(result.isSuccess());

            assertEquals(
                    "Lab test added to order successfully",
                    result.getMessage()
            );

            assertEquals(
                    itemResponse,
                    result.getData()
            );
        }

        verify(labOrderItemRepository)
                .save(any(LabOrderItem.class));
    }


    @Test
    void addLabOrderItem_shouldRejectNonDoctor() {

        AddLabOrderItemRequest request =
                mock(AddLabOrderItemRequest.class);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(userRepository.findByEmail("user@medcore.com"))
                .thenReturn(Optional.of(user));

        when(user.getId())
                .thenReturn(20L);

        when(doctorRepository
                .findByUserIdAndDeletedAtIsNull(20L))
                .thenReturn(Optional.empty());

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("user@medcore.com");

            assertThrows(
                    BusinessException.class,
                    () -> labOrderService.addLabOrderItem(
                            500L,
                            request
                    )
            );
        }

        verifyNoInteractions(labOrderRepository);
    }


    @Test
    void addLabOrderItem_shouldThrowWhenOrderNotFound() {

        AddLabOrderItemRequest request =
                mock(AddLabOrderItemRequest.class);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

        when(user.getId())
                .thenReturn(50L);

        when(doctorRepository
                .findByUserIdAndDeletedAtIsNull(50L))
                .thenReturn(Optional.of(doctor));

        when(labOrderRepository
                .findByIdAndDeletedAtIsNull(500L))
                .thenReturn(Optional.empty());

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("doctor@medcore.com");

            assertThrows(
                    ResourceNotFoundException.class,
                    () -> labOrderService.addLabOrderItem(
                            500L,
                            request
                    )
            );
        }
    }


    @Test
    void addLabOrderItem_shouldRejectWrongHospital() {

        AddLabOrderItemRequest request =
                mock(AddLabOrderItemRequest.class);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

        when(user.getId())
                .thenReturn(50L);

        when(doctorRepository
                .findByUserIdAndDeletedAtIsNull(50L))
                .thenReturn(Optional.of(doctor));

        when(labOrderRepository
                .findByIdAndDeletedAtIsNull(500L))
                .thenReturn(Optional.of(labOrder));

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
                    () -> labOrderService.addLabOrderItem(
                            500L,
                            request
                    )
            );
        }
    }


    @Test
    void addLabOrderItem_shouldRejectWrongDoctor() {

        AddLabOrderItemRequest request =
                mock(AddLabOrderItemRequest.class);

        Doctor anotherDoctor =
                mock(Doctor.class);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

        when(user.getId())
                .thenReturn(50L);

        when(doctorRepository
                .findByUserIdAndDeletedAtIsNull(50L))
                .thenReturn(Optional.of(doctor));

        when(doctor.getId())
                .thenReturn(50L);

        when(labOrderRepository
                .findByIdAndDeletedAtIsNull(500L))
                .thenReturn(Optional.of(labOrder));

        when(labOrder.getHospital())
                .thenReturn(hospital);

        when(hospital.getId())
                .thenReturn(1L);

        when(labOrder.getDoctor())
                .thenReturn(anotherDoctor);

        when(anotherDoctor.getId())
                .thenReturn(99L);

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("doctor@medcore.com");

            assertThrows(
                    BusinessException.class,
                    () -> labOrderService.addLabOrderItem(
                            500L,
                            request
                    )
            );
        }
    }


    @Test
    void addLabOrderItem_shouldRejectNonOrderedStatus() {

        AddLabOrderItemRequest request =
                mock(AddLabOrderItemRequest.class);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

        when(user.getId())
                .thenReturn(50L);

        when(doctorRepository
                .findByUserIdAndDeletedAtIsNull(50L))
                .thenReturn(Optional.of(doctor));

        when(doctor.getId())
                .thenReturn(50L);

        when(labOrderRepository
                .findByIdAndDeletedAtIsNull(500L))
                .thenReturn(Optional.of(labOrder));

        when(labOrder.getHospital())
                .thenReturn(hospital);

        when(hospital.getId())
                .thenReturn(1L);

        when(labOrder.getDoctor())
                .thenReturn(doctor);

        when(labOrder.getStatus())
                .thenReturn(LabOrderStatus.PROCESSING);

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("doctor@medcore.com");

            assertThrows(
                    BusinessException.class,
                    () -> labOrderService.addLabOrderItem(
                            500L,
                            request
                    )
            );
        }

        verifyNoInteractions(labTestRepository);
    }


    @Test
    void addLabOrderItem_shouldRejectDuplicateTest() {

        AddLabOrderItemRequest request =
                mock(AddLabOrderItemRequest.class);

        when(request.getLabTestId())
                .thenReturn(100L);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

        when(user.getId())
                .thenReturn(50L);

        when(doctorRepository
                .findByUserIdAndDeletedAtIsNull(50L))
                .thenReturn(Optional.of(doctor));

        when(doctor.getId())
                .thenReturn(50L);

        when(labOrderRepository
                .findByIdAndDeletedAtIsNull(500L))
                .thenReturn(Optional.of(labOrder));

        when(labOrder.getHospital())
                .thenReturn(hospital);

        when(hospital.getId())
                .thenReturn(1L);

        when(labOrder.getDoctor())
                .thenReturn(doctor);

        when(labOrder.getStatus())
                .thenReturn(LabOrderStatus.ORDERED);

        when(labOrderItemRepository
                .existsByLabOrderIdAndLabTestIdAndDeletedAtIsNull(
                        500L,
                        100L
                ))
                .thenReturn(true);

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("doctor@medcore.com");

            assertThrows(
                    BusinessException.class,
                    () -> labOrderService.addLabOrderItem(
                            500L,
                            request
                    )
            );
        }

        verifyNoInteractions(labTestRepository);
    }


    @Test
    void addLabOrderItem_shouldThrowWhenLabTestNotFound() {

        AddLabOrderItemRequest request =
                mock(AddLabOrderItemRequest.class);

        when(request.getLabTestId())
                .thenReturn(100L);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

        when(user.getId())
                .thenReturn(50L);

        when(doctorRepository
                .findByUserIdAndDeletedAtIsNull(50L))
                .thenReturn(Optional.of(doctor));

        when(doctor.getId())
                .thenReturn(50L);

        when(labOrderRepository
                .findByIdAndDeletedAtIsNull(500L))
                .thenReturn(Optional.of(labOrder));

        when(labOrder.getHospital())
                .thenReturn(hospital);

        when(hospital.getId())
                .thenReturn(1L);

        when(labOrder.getDoctor())
                .thenReturn(doctor);

        when(labOrder.getStatus())
                .thenReturn(LabOrderStatus.ORDERED);

        when(labOrderItemRepository
                .existsByLabOrderIdAndLabTestIdAndDeletedAtIsNull(
                        500L,
                        100L
                ))
                .thenReturn(false);

        when(labTestRepository
                .findByIdAndDeletedAtIsNull(100L))
                .thenReturn(Optional.empty());

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("doctor@medcore.com");

            assertThrows(
                    ResourceNotFoundException.class,
                    () -> labOrderService.addLabOrderItem(
                            500L,
                            request
                    )
            );
        }
    }


    // ============================================================
    // GET LAB ORDER
    // ============================================================

    @Test
    void getLabOrderById_shouldReturnSuccessfully() {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

        when(labOrderRepository
                .findByIdAndDeletedAtIsNull(500L))
                .thenReturn(Optional.of(labOrder));

        when(labOrder.getHospital())
                .thenReturn(hospital);

        when(hospital.getId())
                .thenReturn(1L);

        when(labOrder.getId())
                .thenReturn(500L);

        when(labOrderItemRepository
                .findByLabOrderIdAndDeletedAtIsNull(500L))
                .thenReturn(List.of(labOrderItem));

        when(labOrderItemMapper.toResponse(labOrderItem))
                .thenReturn(itemResponse);

        when(labOrderMapper.toResponse(
                labOrder,
                List.of(itemResponse)
        )).thenReturn(orderResponse);

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("doctor@medcore.com");

            ApiResponse<LabOrderResponse> result =
                    labOrderService.getLabOrderById(500L);

            assertTrue(result.isSuccess());

            assertEquals(
                    "Lab order fetched successfully",
                    result.getMessage()
            );

            assertEquals(
                    orderResponse,
                    result.getData()
            );
        }
    }


    @Test
    void getLabOrderById_shouldThrowWhenNotFound() {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

        when(labOrderRepository
                .findByIdAndDeletedAtIsNull(500L))
                .thenReturn(Optional.empty());

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("doctor@medcore.com");

            assertThrows(
                    ResourceNotFoundException.class,
                    () -> labOrderService.getLabOrderById(500L)
            );
        }

        verifyNoInteractions(labOrderItemRepository);
    }


    @Test
    void getLabOrderById_shouldRejectWrongHospital() {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

        when(labOrderRepository
                .findByIdAndDeletedAtIsNull(500L))
                .thenReturn(Optional.of(labOrder));

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
                    () -> labOrderService.getLabOrderById(500L)
            );
        }

        verifyNoInteractions(labOrderItemRepository);
    }


    // ============================================================
    // UPDATE STATUS
    // ============================================================

    @Test
    void updateStatus_shouldAllowOrderedToSampleCollected() {

        updateStatusSuccess(
                LabOrderStatus.ORDERED,
                LabOrderStatus.SAMPLE_COLLECTED
        );
    }


    @Test
    void updateStatus_shouldAllowOrderedToCancelled() {

        updateStatusSuccess(
                LabOrderStatus.ORDERED,
                LabOrderStatus.CANCELLED
        );
    }


    @Test
    void updateStatus_shouldAllowSampleCollectedToProcessing() {

        updateStatusSuccess(
                LabOrderStatus.SAMPLE_COLLECTED,
                LabOrderStatus.PROCESSING
        );
    }


    @Test
    void updateStatus_shouldAllowSampleCollectedToCancelled() {

        updateStatusSuccess(
                LabOrderStatus.SAMPLE_COLLECTED,
                LabOrderStatus.CANCELLED
        );
    }


    @Test
    void updateStatus_shouldAllowProcessingToCompleted() {

        updateStatusSuccess(
                LabOrderStatus.PROCESSING,
                LabOrderStatus.COMPLETED
        );
    }


    @Test
    void updateStatus_shouldAllowProcessingToCancelled() {

        updateStatusSuccess(
                LabOrderStatus.PROCESSING,
                LabOrderStatus.CANCELLED
        );
    }


    private void updateStatusSuccess(
            LabOrderStatus currentStatus,
            LabOrderStatus newStatus) {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

        when(labOrderRepository
                .findByIdAndDeletedAtIsNull(500L))
                .thenReturn(Optional.of(labOrder));

        when(labOrder.getHospital())
                .thenReturn(hospital);

        when(hospital.getId())
                .thenReturn(1L);

        when(labOrder.getStatus())
                .thenReturn(currentStatus);

        when(labOrder.getId())
                .thenReturn(500L);

        when(labOrderRepository.save(labOrder))
                .thenReturn(labOrder);

        when(labOrderItemRepository
                .findByLabOrderIdAndDeletedAtIsNull(500L))
                .thenReturn(List.of());

        when(labOrderMapper.toResponse(
                labOrder,
                List.of()
        )).thenReturn(orderResponse);

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("doctor@medcore.com");

            ApiResponse<LabOrderResponse> result =
                    labOrderService.updateStatus(
                            500L,
                            newStatus
                    );

            assertTrue(result.isSuccess());

            assertEquals(
                    "Lab order status updated successfully",
                    result.getMessage()
            );

            assertEquals(
                    orderResponse,
                    result.getData()
            );
        }

        verify(labOrder)
                .setStatus(newStatus);

        verify(labOrderRepository)
                .save(labOrder);
    }


    @Test
    void updateStatus_shouldRejectInvalidTransition() {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

        when(labOrderRepository
                .findByIdAndDeletedAtIsNull(500L))
                .thenReturn(Optional.of(labOrder));

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
                    () -> labOrderService.updateStatus(
                            500L,
                            LabOrderStatus.COMPLETED
                    )
            );
        }

        verify(labOrderRepository, never())
                .save(any());
    }


    @Test
    void updateStatus_shouldThrowWhenNotFound() {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

        when(labOrderRepository
                .findByIdAndDeletedAtIsNull(500L))
                .thenReturn(Optional.empty());

        try (MockedStatic<SecurityUtil> securityMock =
                     mockStatic(SecurityUtil.class)) {

            securityMock
                    .when(SecurityUtil::getCurrentUsername)
                    .thenReturn("doctor@medcore.com");

            assertThrows(
                    ResourceNotFoundException.class,
                    () -> labOrderService.updateStatus(
                            500L,
                            LabOrderStatus.COMPLETED
                    )
            );
        }

        verifyNoInteractions(labOrderItemRepository);
    }


    @Test
    void updateStatus_shouldRejectWrongHospital() {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(user));

        when(labOrderRepository
                .findByIdAndDeletedAtIsNull(500L))
                .thenReturn(Optional.of(labOrder));

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
                    () -> labOrderService.updateStatus(
                            500L,
                            LabOrderStatus.COMPLETED
                    )
            );
        }

        verify(labOrderRepository, never())
                .save(any());
    }
}