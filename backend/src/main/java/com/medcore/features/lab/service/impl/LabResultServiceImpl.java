package com.medcore.features.lab.service.impl;

import com.medcore.common.cache.TenantCacheEvictService;
import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.security.SecurityUtil;
import com.medcore.common.security.TenantContextService;

import com.medcore.features.doctor.repository.DoctorRepository;

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

import com.medcore.features.patient.repository.PatientRepository;

import com.medcore.features.user.entity.User;
import com.medcore.features.user.enums.RoleName;
import com.medcore.features.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LabResultServiceImpl
        implements LabResultService {

    private static final Logger log =
            LoggerFactory.getLogger(
                    LabResultServiceImpl.class
            );

    private final LabResultRepository labResultRepository;
    private final LabOrderItemRepository labOrderItemRepository;
    private final LabOrderRepository labOrderRepository;

    private final UserRepository userRepository;
    private final LabResultMapper labResultMapper;

    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    private final TenantContextService tenantContextService;
    private final TenantCacheEvictService tenantCacheEvictService;


     

    @Override
    @Transactional
    public ApiResponse<LabResultResponse> createResult(
            Long labOrderItemId,
            CreateLabResultRequest request) {

        User currentUser =
                getCurrentUser();

        /*
         * Only LAB_TECHNICIAN can create lab results.
         */
        validateLabTechnician(currentUser);

        LabOrderItem item =
                labOrderItemRepository
                        .findByIdAndDeletedAtIsNull(
                                labOrderItemId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Lab order item not found"
                                )
                        );

        LabOrder order =
                item.getLabOrder();

        if (order == null) {

            throw new BusinessException(
                    "Lab order item is not associated with a lab order"
            );
        }

        Long hospitalId =
                tenantContextService
                        .getCurrentHospitalId();

        /*
         * Validate tenant isolation.
         *
         * hospitalId == null:
         *      only SUPER_ADMIN is allowed.
         *
         * hospitalId != null:
         *      order must belong to current hospital.
         */
        validateHospitalAccess(
                currentUser,
                order,
                hospitalId
        );

        /*
         * Result can only be created while
         * the lab order is PROCESSING.
         */
        if (order.getStatus()
                != LabOrderStatus.PROCESSING) {

            throw new BusinessException(
                    "Lab result can only be entered while order is processing"
            );
        }

        /*
         * One result per lab order item.
         */
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

        log.info(
                "Lab result created: labOrderItemId={}, labOrderId={}, hospitalId={}, userId={}",
                labOrderItemId,
                order.getId(),
                hospitalId,
                currentUser.getId()
        );

        /*
         * LabOrderResponse may contain lab result information.
         *
         * Therefore invalidate cached lab orders.
         */
        tenantCacheEvictService
                .evictLabOrders();

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

            log.info(
                    "Lab order automatically completed: labOrderId={}, hospitalId={}, completedByUserId={}",
                    order.getId(),
                    hospitalId,
                    currentUser.getId()
            );

            tenantCacheEvictService
                    .evictLabOrders();
        }

        return ApiResponse
                .<LabResultResponse>builder()
                .success(true)
                .message(
                        "Lab result created successfully"
                )
                .data(
                        labResultMapper.toResponse(
                                savedResult
                        )
                )
                .build();
    }
 
    @Override
    @Transactional(readOnly = true)
    public ApiResponse<LabResultResponse> getResult(
            Long labOrderItemId) {

        User currentUser =
                getCurrentUser();

        LabOrderItem item =
                labOrderItemRepository
                        .findByIdAndDeletedAtIsNull(
                                labOrderItemId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Lab order item not found"
                                )
                        );

        LabOrder order =
                item.getLabOrder();

        if (order == null) {

            throw new BusinessException(
                    "Lab order item is not associated with a lab order"
            );
        }

        Long hospitalId =
                tenantContextService
                        .getCurrentHospitalId();

        /*
         * STEP 1:
         * Validate tenant access.
         */
        validateHospitalAccess(
                currentUser,
                order,
                hospitalId
        );

        /*
         * STEP 2:
         * Validate whether the current user
         * can view this particular result.
         */
        validateResultViewAccess(
                currentUser,
                order
        );

        LabResult result =
                labResultRepository
                        .findByLabOrderItemIdAndDeletedAtIsNull(
                                labOrderItemId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Lab result not found"
                                )
                        );

        log.debug(
                "Lab result fetched: labOrderItemId={}, labOrderId={}, hospitalId={}, userId={}",
                labOrderItemId,
                order.getId(),
                hospitalId,
                currentUser.getId()
        );

        return ApiResponse
                .<LabResultResponse>builder()
                .success(true)
                .message(
                        "Lab result fetched successfully"
                )
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

        User currentUser =
                getCurrentUser();

        /*
         * Only LAB_TECHNICIAN can update results.
         */
        validateLabTechnician(currentUser);

        LabOrderItem item =
                labOrderItemRepository
                        .findByIdAndDeletedAtIsNull(
                                labOrderItemId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Lab order item not found"
                                )
                        );

        LabOrder order =
                item.getLabOrder();

        if (order == null) {

            throw new BusinessException(
                    "Lab order item is not associated with a lab order"
            );
        }

        Long hospitalId =
                tenantContextService
                        .getCurrentHospitalId();

        /*
         * Validate tenant isolation.
         */
        validateHospitalAccess(
                currentUser,
                order,
                hospitalId
        );

        /*
         * Result can only be modified while
         * the order is PROCESSING.
         */
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
                                )
                        );

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

        /*
         * LabOrderResponse can contain lab result
         * information, so invalidate the cache.
         */
        tenantCacheEvictService
                .evictLabOrders();

        log.info(
                "Lab result updated: labOrderItemId={}, labOrderId={}, hospitalId={}, userId={}",
                labOrderItemId,
                order.getId(),
                hospitalId,
                currentUser.getId()
        );

        return ApiResponse
                .<LabResultResponse>builder()
                .success(true)
                .message(
                        "Lab result updated successfully"
                )
                .data(
                        labResultMapper.toResponse(
                                savedResult
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
                        )
                );
    }
 

    private void validateLabTechnician(
            User user) {

        if (user.getRole() == null
                || user.getRole().getName()
                != RoleName.LAB_TECHNICIAN) {

            throw new BusinessException(
                    "Only lab technicians can perform this operation"
            );
        }
    }
 

    private void validateHospitalAccess(
            User currentUser,
            LabOrder order,
            Long hospitalId) {

        /*
         *  
         * CASE 1:
         * No hospital context.
         *
         * Only SUPER_ADMIN is allowed.
         *  
         */
        if (hospitalId == null) {

            if (currentUser.getRole() == null
                    || currentUser.getRole().getName()
                    != RoleName.SUPER_ADMIN) {

                throw new BusinessException(
                        "Only SUPER_ADMIN can access data without a hospital context"
                );
            }

            /*
             * SUPER_ADMIN can access data
             * from any hospital.
             */
            return;
        }


        /*
         *  
         * CASE 2:
         * Hospital context exists.
         *
         * The resource MUST belong to the current hospital.
         *  
         */

        if (order.getHospital() == null
                || !order.getHospital()
                .getId()
                .equals(hospitalId)) {

            throw new BusinessException(
                    "You are not authorized to access this hospital data"
            );
        }
    }


     
    private void validateResultViewAccess(
            User currentUser,
            LabOrder order) {

        RoleName role =
                currentUser.getRole() != null
                        ? currentUser.getRole().getName()
                        : null;


        /*
         * 
         * SUPER_ADMIN
         *  
         *
         * validateHospitalAccess() already verified that
         * hospitalId == null can only be SUPER_ADMIN.
         *
         * Therefore SUPER_ADMIN can view any result.
         */
        if (role == RoleName.SUPER_ADMIN) {
            return;
        }


        /*
         * 
         * LAB TECHNICIAN
         *  
         *
         * Tenant isolation has already been checked by
         * validateHospitalAccess().
         *
         * Therefore a LAB_TECHNICIAN can view lab results
         * inside the current hospital.
         */
        if (role == RoleName.LAB_TECHNICIAN) {
            return;
        }


        /*
         *  
         *  
         *
         * Doctor can only view a result if the doctor
         * owns the lab order.
         */
        if (role == RoleName.DOCTOR) {

            boolean isDoctor =
                    doctorRepository
                            .findByUserIdAndDeletedAtIsNull(
                                    currentUser.getId()
                            )
                            .map(
                                    doctor ->
                                            order.getDoctor() != null
                                                    && order.getDoctor()
                                                    .getId()
                                                    .equals(
                                                            doctor.getId()
                                                    )
                            )
                            .orElse(false);

            if (isDoctor) {
                return;
            }
        }


        /*
         *  
         * PATIENT
         *  
         *
         * Patient can only view a result if the patient
         * owns the lab order.
         *
         * The hospital has already been validated by
         * validateHospitalAccess().
         */
        if (role == RoleName.PATIENT) {

            /*
             * Get the patient's profile through
             * the currently authenticated user.
             */
            boolean isPatient =
                    patientRepository
                            .findByUserIdAndHospitalIdAndDeletedAtIsNull(
                                    currentUser.getId(),
                                    order.getHospital().getId()
                            )
                            .map(
                                    patient ->
                                            order.getPatient() != null
                                                    && order.getPatient()
                                                    .getId()
                                                    .equals(
                                                            patient.getId()
                                                    )
                            )
                            .orElse(false);

            if (isPatient) {
                return;
            }
        }

 
        throw new BusinessException(
                "You are not authorized to access this lab result"
        );
    }
}