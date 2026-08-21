package com.medcore.features.lab.service.impl;

 import com.medcore.common.cache.TenantCacheEvictService;
import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.security.SecurityUtil;
import com.medcore.common.security.TenantContextService;

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

import com.medcore.features.lab.service.LabResultService;

import com.medcore.features.user.entity.User;
import com.medcore.features.user.repository.UserRepository;

import com.medcore.features.doctor.repository.DoctorRepository;
import com.medcore.features.patient.repository.PatientRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LabResultServiceImpl
        implements LabResultService {

    private final LabResultRepository labResultRepository;
    private final LabOrderItemRepository labOrderItemRepository;
    private final LabOrderRepository labOrderRepository;
    private final UserRepository userRepository;
    private final LabResultMapper labResultMapper;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final TenantContextService tenantContextService;
    private final TenantCacheEvictService tenantCacheEvictService;
 
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
    public ApiResponse<LabResultResponse> createResult(
            Long labOrderItemId,
            CreateLabResultRequest request) {

        User currentUser = getCurrentUser();

        LabOrderItem item =
                labOrderItemRepository
                        .findByIdAndDeletedAtIsNull(
                                labOrderItemId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Lab order item not found"
                                ));

        LabOrder order =
                item.getLabOrder();

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        if (hospitalId != null
                && (order.getHospital() == null
                || !order.getHospital().getId()
                        .equals(hospitalId))) {

            throw new BusinessException(
                    "You are not authorized to access this hospital data"
            );
        }

        if (order.getStatus()
                != LabOrderStatus.PROCESSING) {

            throw new BusinessException(
                    "Lab result can only be entered while order is processing"
            );
        }

        if (labResultRepository
                .existsByLabOrderItemIdAndDeletedAtIsNull(
                        labOrderItemId
                )) {

            throw new BusinessException(
                    "Result already exists for this lab test"
            );
        }

        LabResult result =
                labResultMapper.toEntity(
                        request,
                        item
                );

        LabResult savedResult =
                labResultRepository.save(result);
        
        

        List<LabOrderItem> items =
                labOrderItemRepository
                        .findByLabOrderIdAndDeletedAtIsNull(
                                order.getId()
                        );

        boolean allCompleted =
                items.stream()
                        .allMatch(
                                testItem ->
                                        labResultRepository
                                                .existsByLabOrderItemIdAndDeletedAtIsNull(
                                                        testItem.getId()
                                                )
                        );

        if (allCompleted) {

            order.setStatus(
                    LabOrderStatus.COMPLETED
            );

            labOrderRepository.save(order);

            tenantCacheEvictService.evictLabOrders();
        }

        return ApiResponse.<LabResultResponse>builder()
                .success(true)
                .message("Lab result created successfully")
                .data(
                        labResultMapper.toResponse(
                                savedResult
                        )
                )
                .build();
    }

    @Override
    public ApiResponse<LabResultResponse> getResult(
            Long labOrderItemId) {

        User currentUser = getCurrentUser();

        LabOrderItem item =
                labOrderItemRepository
                        .findByIdAndDeletedAtIsNull(
                                labOrderItemId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Lab order item not found"
                                ));

        LabOrder order =
                item.getLabOrder();

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        if (hospitalId != null
                && (order.getHospital() == null
                || !order.getHospital().getId()
                        .equals(hospitalId))) {

            throw new BusinessException(
                    "You are not authorized to access this hospital data"
            );
        }

        boolean authorized = false;

        if (order.getDoctor() != null) {

            boolean isDoctor =
                    doctorRepository
                            .findByUserIdAndDeletedAtIsNull(currentUser.getId())
                            .map(doctor ->
                                    order.getDoctor().getId()
                                            .equals(doctor.getId())
                            )
                            .orElse(false);

            if (isDoctor) {
                authorized = true;
            }
        }

        if (order.getPatient() != null) {

            boolean isPatient =
                    patientRepository
                            .findByUserIdAndHospitalIdAndDeletedAtIsNull(
                                    currentUser.getId(),
                                    tenantContextService.getCurrentHospitalId()
                            )
                            .map(patient ->
                                    order.getPatient()
                                            .getId()
                                            .equals(patient.getId())
                            )
                            .orElse(false);

            if (isPatient) {
                authorized = true;
            }
        }

        if (!authorized) {

            throw new BusinessException(
                    "You are not authorized to access this lab result"
            );
        }

        LabResult result =
                labResultRepository
                        .findByLabOrderItemIdAndDeletedAtIsNull(
                                labOrderItemId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Lab result not found"
                                ));

        return ApiResponse.<LabResultResponse>builder()
                .success(true)
                .message("Lab result fetched successfully")
                .data(
                        labResultMapper.toResponse(
                                result
                        )
                )
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<LabResultResponse> updateResult(
            Long labOrderItemId,
            CreateLabResultRequest request) {

        User currentUser = getCurrentUser();

        LabOrderItem item =
                labOrderItemRepository
                        .findByIdAndDeletedAtIsNull(
                                labOrderItemId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Lab order item not found"
                                ));

        LabOrder order =
                item.getLabOrder();

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        if (hospitalId != null
                && (order.getHospital() == null
                || !order.getHospital().getId()
                        .equals(hospitalId))) {

            throw new BusinessException(
                    "You are not authorized to access this hospital data"
            );
        }

        if (order.getStatus()
                != LabOrderStatus.PROCESSING) {

            throw new BusinessException(
                    "Lab result can only be modified while order is processing"
            );
        }

        LabResult result =
                labResultRepository
                        .findByLabOrderItemIdAndDeletedAtIsNull(
                                labOrderItemId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Lab result not found"
                                ));

        result.setResultValue(
                request.getResultValue()
        );

        result.setUnit(
                request.getUnit()
        );

        result.setReferenceRange(
                request.getReferenceRange()
        );

        result.setRemarks(
                request.getRemarks()
        );

        result.setAbnormal(
                Boolean.TRUE.equals(
                        request.getAbnormal()
                )
        );

        result.setResultDate(
                LocalDateTime.now()
        );

        LabResult savedResult =
                labResultRepository.save(result);

        return ApiResponse.<LabResultResponse>builder()
                .success(true)
                .message("Lab result updated successfully")
                .data(
                        labResultMapper.toResponse(
                                savedResult
                        )
                )
                .build();
    }
}