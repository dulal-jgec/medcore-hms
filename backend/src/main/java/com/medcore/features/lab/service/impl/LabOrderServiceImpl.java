package com.medcore.features.lab.service.impl;

import com.medcore.common.exception.BusinessException;


import com.medcore.features.notification.service.NotificationService;
import com.medcore.features.notification.enums.NotificationType;
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

import com.medcore.features.lab.service.LabOrderService;

import com.medcore.features.patient.entity.Patient;

import com.medcore.features.user.entity.User;
import com.medcore.features.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import com.medcore.common.cache.TenantCacheEvictService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@Service
@RequiredArgsConstructor
public class LabOrderServiceImpl implements LabOrderService {
	
	private static final Logger log =
	        LoggerFactory.getLogger(LabOrderServiceImpl.class);

    private final LabOrderRepository labOrderRepository;
    private final LabOrderItemRepository labOrderItemRepository;

    private final AppointmentRepository appointmentRepository;

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    private final LabTestRepository labTestRepository;

    private final LabOrderMapper labOrderMapper;
    private final LabOrderItemMapper labOrderItemMapper;

    private final TenantContextService tenantContextService;
    private final TenantCacheEvictService tenantCacheEvictService;
    private final NotificationService notificationService;
    
    @Override
    @Transactional
    public ApiResponse<LabOrderResponse> createLabOrder(
            CreateLabOrderRequest request) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        User currentUser = getCurrentUser();

        Doctor currentDoctor =
                doctorRepository
                        .findByUserIdAndDeletedAtIsNull(currentUser.getId())
                        .orElseThrow(() ->
                                new BusinessException(
                                        "Only doctors can create lab orders"
                                ));

        Appointment appointment =
                appointmentRepository
                        .findByIdAndDeletedAtIsNull(
                                request.getAppointmentId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Appointment not found"
                                ));

        if (hospitalId != null
                && (appointment.getHospital() == null
                || !appointment.getHospital().getId()
                        .equals(hospitalId))) {

            throw new BusinessException(
                    "You are not authorized to access this hospital data"
            );
        }

        if (!appointment.getDoctor().getId()
                .equals(currentDoctor.getId())) {

            throw new BusinessException(
                    "You are not authorized to create a lab order for this appointment"
            );
        }

        if (appointment.getStatus()
                != AppointmentStatus.COMPLETED) {

            throw new BusinessException(
                    "Lab order can only be created for a completed appointment"
            );
        }

        if (labOrderRepository
                .existsByAppointmentIdAndDeletedAtIsNull(
                        appointment.getId()
                )) {

            throw new BusinessException(
                    "Lab order already exists for this appointment"
            );
        }

        Doctor doctor = appointment.getDoctor();
        Patient patient = appointment.getPatient();
        Hospital hospital = appointment.getHospital();

        LabOrder labOrder =
                labOrderMapper.toEntity(
                        request,
                        appointment,
                        doctor,
                        patient,
                        hospital
                );

        LabOrder savedOrder =
                labOrderRepository.save(labOrder);

        for (Long labTestId : request.getLabTestIds()) {

            LabTest labTest =
                    labTestRepository
                            .findByIdAndDeletedAtIsNull(
                                    labTestId
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Lab test not found: "
                                                    + labTestId
                                    ));

            LabOrderItem item =
                    LabOrderItem.builder()
                            .labOrder(savedOrder)
                            .labTest(labTest)
                            .build();

            labOrderItemRepository.save(item);
        }   
            log.info(
                    "Lab order created: labOrderId={}, appointmentId={}, doctorId={}, patientId={}, hospitalId={}",
                    savedOrder.getId(),
                    appointment.getId(),
                    doctor.getId(),
                    patient.getId(),
                    hospital.getId()
            );
        
        
        notificationService.sendNotification(
                patient.getUser().getId(),
                NotificationType.LAB_ORDER_CREATED,
                "New Lab Order",
                "A new lab order has been created for you."
        );

        List<LabOrderItemResponse> items =
                labOrderItemRepository
                        .findByLabOrderIdAndDeletedAtIsNull(
                                savedOrder.getId()
                        )
                        .stream()
                        .map(labOrderItemMapper::toResponse)
                        .toList();
        
        tenantCacheEvictService.evictLabOrders();

        return ApiResponse.<LabOrderResponse>builder()
                .success(true)
                .message("Lab order created successfully")
                .data(
                        labOrderMapper.toResponse(
                                savedOrder,
                                items
                        )
                )
                .build();
    }


    @Override
    @Transactional
    public ApiResponse<LabOrderItemResponse> addLabOrderItem(
            Long labOrderId,
            AddLabOrderItemRequest request) {

        User currentUser = getCurrentUser();

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        Doctor currentDoctor =
                doctorRepository
                        .findByUserIdAndDeletedAtIsNull(currentUser.getId())
                        .orElseThrow(() ->
                                new BusinessException(
                                        "Only doctors can add lab tests"
                                ));

        LabOrder labOrder =
                labOrderRepository
                        .findByIdAndDeletedAtIsNull(
                                labOrderId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Lab order not found"
                                ));

        if (hospitalId != null
                && (labOrder.getHospital() == null
                || !labOrder.getHospital().getId()
                        .equals(hospitalId))) {

            throw new BusinessException(
                    "You are not authorized to access this hospital data"
            );
        }

        if (!labOrder.getDoctor().getId()
                .equals(currentDoctor.getId())) {

            throw new BusinessException(
                    "You are not authorized to modify this lab order"
            );
        }

        if (labOrder.getStatus()
                != LabOrderStatus.ORDERED) {

            throw new BusinessException(
                    "Only ordered lab orders can be modified"
            );
        }

        if (labOrderItemRepository
                .existsByLabOrderIdAndLabTestIdAndDeletedAtIsNull(
                        labOrderId,
                        request.getLabTestId()
                )) {

            throw new BusinessException(
                    "This lab test is already added to the order"
            );
        }

        LabTest labTest =
                labTestRepository
                        .findByIdAndDeletedAtIsNull(
                                request.getLabTestId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Lab test not found"
                                ));

        LabOrderItem item =
                LabOrderItem.builder()
                        .labOrder(labOrder)
                        .labTest(labTest)
                        .instructions(request.getInstructions())
                        .build();

        LabOrderItem savedItem =
                labOrderItemRepository.save(item);
        
        log.info(
                "Lab test added to order: labOrderId={}, labTestId={}, doctorId={}, hospitalId={}",
                labOrderId,
                request.getLabTestId(),
                currentDoctor.getId(),
                hospitalId
        );
        
        tenantCacheEvictService.evictLabOrders();

        return ApiResponse.<LabOrderItemResponse>builder()
                .success(true)
                .message("Lab test added to order successfully")
                .data(
                        labOrderItemMapper.toResponse(
                                savedItem
                        )
                )
                .build();
    }


    @Override
    @Transactional(readOnly = true)
    @Cacheable(
            cacheNames = "labOrders",
            keyGenerator = "tenantCacheKeyGenerator"
    )
    public ApiResponse<LabOrderResponse> getLabOrderById(
            Long labOrderId) {

 
        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        LabOrder labOrder =
                labOrderRepository
                        .findByIdAndDeletedAtIsNull(
                                labOrderId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Lab order not found"
                                ));

        if (hospitalId != null
                && (labOrder.getHospital() == null
                || !labOrder.getHospital().getId()
                        .equals(hospitalId))) {

            throw new BusinessException(
                    "You are not authorized to access this hospital data"
            );
        }

        List<LabOrderItemResponse> items =
                labOrderItemRepository
                        .findByLabOrderIdAndDeletedAtIsNull(
                                labOrder.getId()
                        )
                        .stream()
                        .map(labOrderItemMapper::toResponse)
                        .toList();

        return ApiResponse.<LabOrderResponse>builder()
                .success(true)
                .message("Lab order fetched successfully")
                .data(
                        labOrderMapper.toResponse(
                                labOrder,
                                items
                        )
                )
                .build();
    }


    private User getCurrentUser() {

        String email =
                SecurityUtil.getCurrentUsername();

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Current user not found"
                        ));
    }


    @Override
    @Transactional
    public ApiResponse<LabOrderResponse> updateStatus(
            Long labOrderId,
            LabOrderStatus status) {

         

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        LabOrder labOrder =
                labOrderRepository
                        .findByIdAndDeletedAtIsNull(
                                labOrderId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Lab order not found"
                                ));

        if (hospitalId != null
                && (labOrder.getHospital() == null
                || !labOrder.getHospital().getId()
                        .equals(hospitalId))) {

            throw new BusinessException(
                    "You are not authorized to access this hospital data"
            );
        }

        LabOrderStatus currentStatus =
                labOrder.getStatus();

        boolean validTransition =
                switch (currentStatus) {

                    case ORDERED ->
                            status == LabOrderStatus.SAMPLE_COLLECTED
                                    || status == LabOrderStatus.CANCELLED;

                    case SAMPLE_COLLECTED ->
                            status == LabOrderStatus.PROCESSING
                                    || status == LabOrderStatus.CANCELLED;

                    case PROCESSING ->
                            status == LabOrderStatus.COMPLETED
                                    || status == LabOrderStatus.CANCELLED;

                    case COMPLETED, CANCELLED ->
                            false;
                };

        if (!validTransition) {

            throw new BusinessException(
                    "Invalid lab order status transition from "
                            + currentStatus
                            + " to "
                            + status
            );
        }

        labOrder.setStatus(status);

        LabOrder savedOrder =
                labOrderRepository.save(labOrder);
        
        log.info(
                "Lab order status updated: labOrderId={}, previousStatus={}, newStatus={}, hospitalId={}",
                labOrderId,
                currentStatus,
                status,
                hospitalId
        );

        List<LabOrderItemResponse> items =
                labOrderItemRepository
                        .findByLabOrderIdAndDeletedAtIsNull(
                                savedOrder.getId()
                        )
                        .stream()
                        .map(labOrderItemMapper::toResponse)
                        .toList();
        
        tenantCacheEvictService.evictLabOrders();

        return ApiResponse.<LabOrderResponse>builder()
                .success(true)
                .message("Lab order status updated successfully")
                .data(
                        labOrderMapper.toResponse(
                                savedOrder,
                                items
                        )
                )
                .build();
    }
}