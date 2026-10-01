package com.medcore.features.hospital.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.security.TenantContextService;
import com.medcore.common.storage.FileStorageService;
import com.medcore.common.storage.FileValidationService;
import com.medcore.common.util.PasswordGenerator;
import com.medcore.features.hospital.dto.request.UpdateHospitalProfileRequest;
import com.medcore.features.hospital.dto.response.HospitalProfileResponse;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.mapper.HospitalMapper;
import com.medcore.features.hospital.repository.HospitalRepository;
import com.medcore.features.hospital.service.HospitalAdminService;
import com.medcore.features.notification.enums.EmailType;
import com.medcore.features.notification.repository.EmailOutboxRepository;
import com.medcore.features.notification.service.EmailOutboxService;
import com.medcore.features.user.entity.User;
import com.medcore.features.user.enums.UserStatus;
import com.medcore.features.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Transactional
public class HospitalAdminServiceImpl implements HospitalAdminService {

    private final HospitalRepository hospitalRepository;
    private final HospitalMapper hospitalMapper;
    private final TenantContextService tenantContextService;
    private final FileStorageService fileStorageService;
    private final FileValidationService fileValidationService;

    private final UserRepository userRepository;
    private final EmailOutboxService emailOutboxService;
    private final EmailOutboxRepository emailOutboxRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<HospitalProfileResponse> getMyHospitalProfile() {

        Hospital hospital =
                tenantContextService.getCurrentHospital();

        HospitalProfileResponse response =
                hospitalMapper.toProfileResponse(hospital);

        return ApiResponse
                .<HospitalProfileResponse>builder()
                .success(true)
                .message("Hospital profile fetched successfully")
                .data(response)
                .build();
    }

    @Override
    public ApiResponse<HospitalProfileResponse> updateMyHospitalProfile(
            UpdateHospitalProfileRequest request) {

        Hospital hospital =
                tenantContextService.getCurrentHospital();

        hospital.setState(request.getState());
        hospital.setAddress(request.getAddress());
        hospital.setPincode(request.getPincode());
        hospital.setEmergencyPhone(request.getEmergencyPhone());
        hospital.setDescription(request.getDescription());

        Hospital updatedHospital =
                hospitalRepository.save(hospital);

        HospitalProfileResponse response =
                hospitalMapper.toProfileResponse(updatedHospital);

        return ApiResponse
                .<HospitalProfileResponse>builder()
                .success(true)
                .message("Hospital profile updated successfully")
                .data(response)
                .build();
    }

    @Override
    public ApiResponse<HospitalProfileResponse> uploadLogo(
            MultipartFile file) {

        Hospital hospital =
                tenantContextService.getCurrentHospital();

        fileValidationService.validateImage(file);

        String logoUrl =
                fileStorageService.upload(
                        file,
                        "medcore/hospitals/"
                                + hospital.getId()
                                + "/logo"
                );

        hospital.setLogoUrl(logoUrl);

        Hospital updatedHospital =
                hospitalRepository.save(hospital);

        HospitalProfileResponse response =
                hospitalMapper.toProfileResponse(updatedHospital);

        return ApiResponse
                .<HospitalProfileResponse>builder()
                .success(true)
                .message("Hospital logo uploaded successfully")
                .data(response)
                .build();
    }

    @Override
    public ApiResponse<HospitalProfileResponse> uploadBanner(
            MultipartFile file) {

        Hospital hospital =
                tenantContextService.getCurrentHospital();

        fileValidationService.validateImage(file);

        String bannerUrl =
                fileStorageService.upload(
                        file,
                        "medcore/hospitals/"
                                + hospital.getId()
                                + "/banner"
                );

        hospital.setBannerUrl(bannerUrl);

        Hospital updatedHospital =
                hospitalRepository.save(hospital);

        HospitalProfileResponse response =
                hospitalMapper.toProfileResponse(updatedHospital);

        return ApiResponse
                .<HospitalProfileResponse>builder()
                .success(true)
                .message("Hospital banner uploaded successfully")
                .data(response)
                .build();
    }

    @Override
    public ApiResponse<String> resendInvitation(Long userId) {

        Hospital hospital =
                tenantContextService.getCurrentHospital();

        User user =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found"
                                )
                        );

        if (user.getHospital() == null
                || !user.getHospital().getId().equals(hospital.getId())) {

            throw new BusinessException(
                    "User does not belong to your hospital"
            );
        }

        if (user.getStatus() != UserStatus.PENDING_VERIFICATION) {

            throw new BusinessException(
                    "User invitation is not pending"
            );
        }

        EmailType emailType;

        switch (user.getRole().getName()) {

            case DOCTOR ->
                    emailType = EmailType.DOCTOR_CREDENTIALS;

            case NURSE ->
                    emailType = EmailType.NURSE_CREDENTIALS;

            case RECEPTIONIST ->
                    emailType = EmailType.RECEPTIONIST_CREDENTIALS;

            case ACCOUNTANT ->
                    emailType = EmailType.ACCOUNTANT_CREDENTIALS;

            default ->
                    throw new BusinessException(
                            "Invitation resend is not supported for this role"
                    );
        }

        long exhaustedAttempts =
                emailOutboxRepository.countExhaustedAttempts(
                        user.getId(),
                        emailType
                );

        if (exhaustedAttempts >= 3) {

            throw new BusinessException(
                    "Maximum invitation attempts reached. "
                            + "Please cancel this invitation and create a new one."
            );
        }

        int invitationAttempt =
                (int) exhaustedAttempts + 1;

        String temporaryPassword =
                PasswordGenerator.generate();

        user.setPassword(
                passwordEncoder.encode(temporaryPassword)
        );

        userRepository.save(user);

        String emailBody = """
                Welcome to MedCore

                Hello %s,

                You have been appointed to work at %s.

                Your login credentials are:

                Email: %s
                Temporary Password: %s

                Please log in to MedCore and change your password
                after your first login.

                Regards,
                MedCore Team
                """.formatted(
                user.getFullName(),
                hospital.getName(),
                user.getEmail(),
                temporaryPassword
        );

        emailOutboxService.createEmail(
                user,
                emailType,
                user.getEmail(),
                "Your MedCore "
                        + user.getRole().getName()
                        + " Account",
                emailBody,
                invitationAttempt
        );

        return ApiResponse
                .<String>builder()
                .success(true)
                .message("Invitation resent successfully")
                .data("Invitation email queued")
                .build();
    }
}