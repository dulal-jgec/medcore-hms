package com.medcore.features.lab.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.security.SecurityUtil;

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

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;
import com.medcore.features.doctor.repository.DoctorRepository;
import com.medcore.features.patient.repository.PatientRepository;
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

        // Hospital isolation
        if (currentUser.getHospital() == null
                || order.getHospital() == null
                || !order.getHospital().getId()
                        .equals(
                                currentUser
                                        .getHospital()
                                        .getId()
                        )) {

            throw new BusinessException(
                    "You are not authorized to access this hospital data"
            );
        }

        // Order must be processing
        if (order.getStatus()
                != LabOrderStatus.PROCESSING) {

            throw new BusinessException(
                    "Lab result can only be entered while order is processing"
            );
        }

        // Prevent duplicate result
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

         
        // Check whether every test has a result
       

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
                    .findByIdAndDeletedAtIsNull(labOrderItemId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Lab order item not found"
                            ));

    LabOrder order = item.getLabOrder();

    // ---------------------------------------------------------
    // Hospital isolation
    // ---------------------------------------------------------

    if (currentUser.getHospital() == null
            || order.getHospital() == null
            || !order.getHospital().getId()
                    .equals(currentUser.getHospital().getId())) {

        throw new BusinessException(
                "You are not authorized to access this hospital data"
        );
    }

    // ---------------------------------------------------------
    // Doctor / Patient ownership
    // ---------------------------------------------------------

    boolean authorized = false;

    // Doctor who created the order
    if (order.getDoctor() != null) {

        boolean isDoctor =
                doctorRepository
                        .findByUserId(currentUser.getId())
                        .map(doctor ->
                                order.getDoctor().getId()
                                        .equals(doctor.getId())
                        )
                        .orElse(false);

        if (isDoctor) {
            authorized = true;
        }
    }

    // Patient who owns the order
    if (order.getPatient() != null) {

        boolean isPatient =
                patientRepository
                        .findByUserId(currentUser.getId())
                        .map(patient ->
                                order.getPatient().getId()
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

    // ---------------------------------------------------------
    // Get result
    // ---------------------------------------------------------

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

        LabOrder order = item.getLabOrder();

        // Hospital isolation
        if (currentUser.getHospital() == null
                || order.getHospital() == null
                || !order.getHospital().getId()
                        .equals(currentUser.getHospital().getId())) {

            throw new BusinessException(
                    "You are not authorized to access this hospital data"
            );
        }

        // Only processing orders can have results modified
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
                java.time.LocalDateTime.now()
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