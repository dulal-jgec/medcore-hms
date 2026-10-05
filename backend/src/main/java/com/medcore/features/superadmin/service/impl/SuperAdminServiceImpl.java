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
import com.medcore.features.lab.controller.LabOrderController;
import com.medcore.features.notification.enums.EmailType;
import com.medcore.features.notification.repository.EmailOutboxRepository;
import com.medcore.features.notification.service.EmailOutboxService;
import com.medcore.features.notification.service.IdempotencyService;
import com.medcore.features.superadmin.dto.response.SuperAdminDashboardResponse;
import com.medcore.features.superadmin.dto.response.SuperAdminResponse;
import com.medcore.features.superadmin.entity.SuperAdmin;
import com.medcore.features.superadmin.enums.SuperAdminStatus;
import com.medcore.features.superadmin.mapper.SuperAdminMapper;
import com.medcore.features.superadmin.repository.SuperAdminRepository;
import com.medcore.features.superadmin.service.SuperAdminService;
import com.medcore.features.user.entity.User;
import com.medcore.features.user.repository.RoleRepository;
import com.medcore.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import org.springframework.data.domain.Page;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.superadmin.dto.request.CreateHospitalAdminRequest;
import com.medcore.features.superadmin.dto.response.CreateHospitalAdminResponse;
import com.medcore.features.user.entity.Role;
import com.medcore.features.user.enums.RoleName;
import com.medcore.features.user.enums.UserStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.medcore.common.exception.DuplicateResourceException;
import com.medcore.common.exception.ResourceNotFoundException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
public class SuperAdminServiceImpl implements SuperAdminService {

    private final LabOrderController labOrderController;

    private final SuperAdminRepository superAdminRepository;
    private final SuperAdminMapper superAdminMapper;
    private final UserRepository userRepository;
    private final HospitalService hospitalService;
    private final HospitalRepository hospitalRepository;
    private final RoleRepository roleRepository;
     private final PasswordEncoder passwordEncoder;
      private final EmailOutboxService emailOutboxService;
     private final EmailOutboxRepository emailOutboxRepository;
     
     private final IdempotencyService idempotencyService;

    
     
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
    
@Transactional
@Override
public ApiResponse<CreateHospitalAdminResponse> createHospitalAdmin(
        CreateHospitalAdminRequest request) {

    validateSuperAdmin();

    String email = request.getEmail().trim().toLowerCase();
    String phone = request.getPhone().trim();

    Optional<User> pendingUser =
            userRepository.findByEmailAndStatus(
                    email,
                    UserStatus.PENDING_VERIFICATION
            );

    if (pendingUser.isPresent()) {
        throw new BusinessException(
                "A pending hospital admin invitation already exists for this email. Please resend the invitation."
        );
    }

    if (userRepository.existsActiveEmail(email)) {
        throw new DuplicateResourceException(
                "Email already exists"
        );
    }

    if (userRepository.existsActivePhone(phone)) {
        throw new DuplicateResourceException(
                "Phone number already exists"
        );
    }

    Hospital hospital = hospitalRepository
            .findByIdAndDeletedAtIsNull(request.getHospitalId())
            .orElseThrow(() ->
                    new ResourceNotFoundException(
                            "Hospital not found"
                    )
            );

    if (hospital.getStatus() != HospitalStatus.ACTIVE) {
        throw new BusinessException(
                "Hospital is not active"
        );
    }

    Role hospitalAdminRole =
            roleRepository.findByName(RoleName.HOSPITAL_ADMIN)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Hospital Admin role not found"
                            )
                    );

    String temporaryPassword =
            generateTemporaryPassword();

    User hospitalAdmin = User.builder()
            .fullName(request.getFullName().trim())
            .email(email)
            .phone(phone)
            .password(
                    passwordEncoder.encode(temporaryPassword)
            )
            .hospital(hospital)
            .role(hospitalAdminRole)
            .status(UserStatus.PENDING_VERIFICATION)
            .emailVerified(false)
            .phoneVerified(false)
            .build();

    User savedAdmin = userRepository.save(hospitalAdmin);

    String emailBody = """
            Welcome to MedCore

            Hello %s,

            You have been appointed as a Hospital Administrator
            for %s.

            Your login credentials are:

            Email: %s
            Temporary Password: %s

            Please log in to MedCore and change your password
            after your first login.

            Regards,
            MedCore Team
            """.formatted(
            savedAdmin.getFullName(),
            hospital.getName(),
            savedAdmin.getEmail(),
            temporaryPassword
    );

    emailOutboxService.createEmail(
            savedAdmin,
            EmailType.HOSPITAL_ADMIN_CREDENTIALS,
            savedAdmin.getEmail(),
            "Your MedCore Hospital Admin Account",
            emailBody,
            1
    );

    CreateHospitalAdminResponse response =
            CreateHospitalAdminResponse.builder()
                    .userId(savedAdmin.getId())
                    .fullName(savedAdmin.getFullName())
                    .email(savedAdmin.getEmail())
                    .phone(savedAdmin.getPhone())
                    .hospitalId(hospital.getId())
                    .hospitalName(hospital.getName())
                    .status(savedAdmin.getStatus())
                    .build();

    return ApiResponse.<CreateHospitalAdminResponse>builder()
            .success(true)
            .message("Hospital Admin created successfully")
            .data(response)
            .build();
}
			

public ApiResponse<String> resendHospitalAdminInvitation(
        Long userId,
        String idempotencyKey
) {

    validateSuperAdmin();

    if (idempotencyService.exists(idempotencyKey)) {
        return ApiResponse.<String>builder()
                .success(true)
                .message("Request already processed")
                .data("Invitation request already accepted")
                .build();
    }

    boolean created =
            idempotencyService.create(
                    idempotencyKey,
                    "RESEND_HOSPITAL_ADMIN_INVITATION"
            );

    if (!created) {
        return ApiResponse.<String>builder()
                .success(true)
                .message("Request already processed")
                .data("Invitation request already accepted")
                .build();
    }
    		

    User hospitalAdmin =
            userRepository.findById(userId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Hospital Admin not found"
                            )
                    );

    if (hospitalAdmin.getRole() == null
            || hospitalAdmin.getRole().getName()
            != RoleName.HOSPITAL_ADMIN) {

        throw new BusinessException(
                "User is not a Hospital Admin"
        );
    }

    if (hospitalAdmin.getStatus()
            != UserStatus.PENDING_VERIFICATION) {

        throw new BusinessException(
                "Hospital Admin invitation is not pending"
        );
    }

    EmailType emailType =
            EmailType.HOSPITAL_ADMIN_CREDENTIALS;

    long exhaustedAttempts =
            emailOutboxRepository.countExhaustedAttempts(
                    hospitalAdmin.getId(),
                    emailType
            );

    if (exhaustedAttempts >= 3) {

        throw new BusinessException(
                "Maximum invitation attempts reached. " +
                "Please cancel this invitation and create a new one."
        );
    }

    int invitationAttempt =
            (int) exhaustedAttempts + 1;

    String temporaryPassword =
            generateTemporaryPassword();

    hospitalAdmin.setPassword(
            passwordEncoder.encode(temporaryPassword)
    );

    userRepository.save(hospitalAdmin);

    String emailBody = """
            Welcome to MedCore

            Hello %s,

            You have been appointed as a Hospital Administrator
            for %s.

            Your login credentials are:

            Email: %s
            Temporary Password: %s

            Please log in to MedCore and change your password
            after your first login.

            Regards,
            MedCore Team
            """.formatted(
            hospitalAdmin.getFullName(),
            hospitalAdmin.getHospital().getName(),
            hospitalAdmin.getEmail(),
            temporaryPassword
    );

    emailOutboxService.createEmail(
            hospitalAdmin,
            emailType,
            hospitalAdmin.getEmail(),
            "Your MedCore Hospital Admin Account",
            emailBody,
            invitationAttempt
    );

    return ApiResponse.<String>builder()
            .success(true)
            .message("Hospital Admin invitation resent successfully")
            .data("Invitation email queued")
            .build();
}
    
    @Override
    public ApiResponse<Page<CreateHospitalAdminResponse>> getAllHospitalAdmins(
            int page,
            int size) {

        validateSuperAdmin();

        if (page < 0) {
            throw new BusinessException(
                    "Page must be greater than or equal to 0"
            );
        }

        if (size < 1 || size > 100) {
            throw new BusinessException(
                    "Page size must be between 1 and 100"
            );
        }

        Pageable pageable =
                PageRequest.of(page, size);

        Page<User> admins =
                userRepository.findByRoleNameAndDeletedAtIsNull(
                        RoleName.HOSPITAL_ADMIN,
                        pageable
                );

        Page<CreateHospitalAdminResponse> response =
                admins.map(user ->
                        CreateHospitalAdminResponse.builder()
                                .userId(user.getId())
                                .fullName(user.getFullName())
                                .email(user.getEmail())
                                .phone(user.getPhone())
                                .hospitalId(
                                        user.getHospital().getId()
                                )
                                .hospitalName(
                                        user.getHospital().getName()
                                )
                                .status(user.getStatus())
                                .build()
                );

        return ApiResponse
                .<Page<CreateHospitalAdminResponse>>builder()
                .success(true)
                .message("Hospital Admins fetched successfully")
                .data(response)
                .build();
    }
    
    private String generateTemporaryPassword() {
        return "Temp@" +
                java.util.UUID.randomUUID()
                        .toString()
                        .substring(0, 8);
    }
    
    
}