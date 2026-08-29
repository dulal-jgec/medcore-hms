package com.medcore.features.superadmin.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.security.SecurityUtil;
import com.medcore.features.hospital.dto.request.CreateHospitalRequest;
import com.medcore.features.hospital.dto.request.UpdateHospitalRequest;
import com.medcore.features.hospital.dto.request.UpdateHospitalStatusRequest;
import com.medcore.features.hospital.dto.response.CreateHospitalResponse;
import com.medcore.features.hospital.enums.HospitalStatus;
import com.medcore.features.hospital.repository.HospitalRepository;
import com.medcore.features.hospital.service.HospitalService;
import com.medcore.features.superadmin.dto.response.SuperAdminDashboardResponse;
import com.medcore.features.superadmin.dto.response.SuperAdminResponse;
import com.medcore.features.superadmin.entity.SuperAdmin;
import com.medcore.features.superadmin.enums.SuperAdminStatus;
import com.medcore.features.superadmin.mapper.SuperAdminMapper;
import com.medcore.features.superadmin.repository.SuperAdminRepository;
import com.medcore.features.superadmin.service.SuperAdminService;
import com.medcore.features.user.entity.User;
import com.medcore.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;

@Service
@RequiredArgsConstructor
public class SuperAdminServiceImpl implements SuperAdminService {

    private final SuperAdminRepository superAdminRepository;
    private final SuperAdminMapper superAdminMapper;
    private final UserRepository userRepository;
    private final HospitalService hospitalService;
    private final HospitalRepository hospitalRepository;
    @Override
    public ApiResponse<SuperAdminResponse> getCurrentSuperAdmin() {

        User currentUser = getCurrentUser();

        SuperAdmin superAdmin =
                superAdminRepository
                        .findByUserIdAndDeletedAtIsNull(
                                currentUser.getId()
                        )
                        .orElseThrow(() ->
                                new BusinessException(
                                        "Super Admin profile not found"
                                )
                        );

        if (superAdmin.getStatus()
                != SuperAdminStatus.ACTIVE) {

            throw new BusinessException(
                    "Inactive Super Admin cannot access the system"
            );
        }

        SuperAdminResponse response =
                superAdminMapper.toResponse(superAdmin);

        return ApiResponse
                .<SuperAdminResponse>builder()
                .success(true)
                .message(
                        "Super Admin profile fetched successfully"
                )
                .data(response)
                .build();
    }

    @Override
    public ApiResponse<CreateHospitalResponse> createHospital(
            CreateHospitalRequest request) {

        validateSuperAdmin();

        return hospitalService.createHospital(request);
    }
    
    @Override
    public ApiResponse<Page<CreateHospitalResponse>> getAllHospitals(
            int page,
            int size,
            String sortBy,
            String sortDir) {

        validateSuperAdmin();

        return hospitalService.getAllHospitals(
                page,
                size,
                sortBy,
                sortDir
        );
    }

    @Override
    public ApiResponse<CreateHospitalResponse> getHospitalById(
            Long hospitalId) {

        validateSuperAdmin();

        return hospitalService.getHospitalById(
                hospitalId
        );
    }
    
    
    @Override
    public ApiResponse<CreateHospitalResponse> updateHospital(
            Long hospitalId,
            UpdateHospitalRequest request) {

        validateSuperAdmin();

        return hospitalService.updateHospital(
                hospitalId,
                request
        );
    }
    
    @Override
    public ApiResponse<CreateHospitalResponse> updateHospitalStatus(
            Long hospitalId,
            UpdateHospitalStatusRequest request) {

        validateSuperAdmin();

        return hospitalService.updateHospitalStatus(
                hospitalId,
                request
        );
    }
    
    @Override
    public ApiResponse<Page<CreateHospitalResponse>> searchHospitals(
            String keyword,
            int page,
            int size) {

        validateSuperAdmin();

        return hospitalService.searchHospitals(
                keyword,
                page,
                size
        );
    }
    
    @Override
    public ApiResponse<String> deleteHospital(Long hospitalId) {

        validateSuperAdmin();

        return hospitalService.deleteHospital(hospitalId);
    }
    
    @Override
    public ApiResponse<String> restoreHospital(Long hospitalId) {

        validateSuperAdmin();

        return hospitalService.restoreHospital(hospitalId);
    }
    
    @Override
    public ApiResponse<SuperAdminDashboardResponse> getDashboard() {

        validateSuperAdmin();

        long totalHospitals =
                hospitalRepository.countByDeletedAtIsNull();

        long activeHospitals =
                hospitalRepository
                        .countByStatusAndDeletedAtIsNull(
                                HospitalStatus.ACTIVE
                        );

        long inactiveHospitals =
                hospitalRepository
                        .countByStatusAndDeletedAtIsNull(
                                HospitalStatus.INACTIVE
                        );

        long deletedHospitals =
                hospitalRepository.countByDeletedAtIsNotNull();

        SuperAdminDashboardResponse response =
                SuperAdminDashboardResponse.builder()
                        .totalHospitals(totalHospitals)
                        .activeHospitals(activeHospitals)
                        .inactiveHospitals(inactiveHospitals)
                        .deletedHospitals(deletedHospitals)
                        .build();

        return ApiResponse
                .<SuperAdminDashboardResponse>builder()
                .success(true)
                .message("Super Admin dashboard fetched successfully")
                .data(response)
                .build();
    }

    private void validateSuperAdmin() {

        User currentUser = getCurrentUser();

        SuperAdmin superAdmin =
                superAdminRepository
                        .findByUserIdAndDeletedAtIsNull(
                                currentUser.getId()
                        )
                        .orElseThrow(() ->
                                new BusinessException(
                                        "Super Admin profile not found"
                                )
                        );

        if (superAdmin.getStatus()
                != SuperAdminStatus.ACTIVE) {

            throw new BusinessException(
                    "Inactive Super Admin cannot perform this action"
            );
        }
    }

    private User getCurrentUser() {

        String username =
                SecurityUtil.getCurrentUsername();

        return userRepository
                .findByEmail(username)
                .orElseThrow(() ->
                        new BusinessException(
                                "User not found"
                        )
                );
    }
    
    
}