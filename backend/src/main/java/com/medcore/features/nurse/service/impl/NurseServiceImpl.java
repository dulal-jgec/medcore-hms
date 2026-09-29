package com.medcore.features.nurse.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.DuplicateResourceException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.security.SecurityUtil;
import com.medcore.common.security.TenantContextService;
import com.medcore.common.storage.FileStorageService;
import com.medcore.common.storage.FileValidationService;
import com.medcore.common.util.PasswordGenerator;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.enums.HospitalStatus;
import com.medcore.features.hospital.repository.HospitalRepository;
import com.medcore.features.nurse.dto.request.CreateNurseRequest;
import com.medcore.features.nurse.dto.request.UpdateMyNurseProfileRequest;
import com.medcore.features.nurse.dto.request.UpdateNurseRequest;
import com.medcore.features.nurse.dto.response.NurseProfileResponse;
import com.medcore.features.nurse.dto.response.NurseResponse;
import com.medcore.features.nurse.entity.Nurse;
import com.medcore.features.nurse.enums.NurseStatus;
import com.medcore.features.nurse.mapper.NurseMapper;
import com.medcore.features.nurse.repository.NurseRepository;
import com.medcore.features.nurse.service.NurseService;
import com.medcore.features.notification.service.EmailOutboxService;
import com.medcore.features.notification.service.EmailService;
import com.medcore.features.user.entity.Role;
import com.medcore.features.user.entity.User;
import com.medcore.features.user.enums.RoleName;
import com.medcore.features.user.enums.UserStatus;
import com.medcore.features.user.repository.RoleRepository;
import com.medcore.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NurseServiceImpl implements NurseService {

    private final NurseRepository nurseRepository;
    private final UserRepository userRepository;
    private final NurseMapper nurseMapper;
    private final HospitalRepository hospitalRepository;
    private final TenantContextService tenantContextService;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailOutboxService emailOutboxService;
    private final FileStorageService fileStorageService;
    private final FileValidationService fileValidationService;

    @Override
@Transactional
public ApiResponse<NurseResponse> createNurse(
        CreateNurseRequest request) {

    Long hospitalId =
            tenantContextService.getCurrentHospitalId();

    Hospital hospital =
            hospitalRepository
                    .findByIdAndDeletedAtIsNull(hospitalId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Hospital not found"
                            ));

    if (hospital.getStatus() != HospitalStatus.ACTIVE) {
        throw new BusinessException(
                "Hospital is not active"
        );
    }

    String email =
            request.getEmail()
                    .trim()
                    .toLowerCase();

    String phone =
            request.getPhone()
                    .trim();

    if (userRepository.existsByEmail(email)) {
        throw new DuplicateResourceException(
                "Email already exists"
        );
    }

    if (userRepository.existsByPhone(phone)) {
        throw new DuplicateResourceException(
                "Phone number already exists"
        );
    }

    Role nurseRole =
            roleRepository
                    .findByName(RoleName.NURSE)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Nurse role not found"
                            ));

    String temporaryPassword =
            PasswordGenerator.generate();

    User user =
            User.builder()
                    .fullName(
                            request.getFullName().trim()
                    )
                    .email(email)
                    .phone(phone)
                    .password(
                            passwordEncoder.encode(
                                    temporaryPassword
                            )
                    )
                    .hospital(hospital)
                    .role(nurseRole)
                    .status(UserStatus.ACTIVE)
                    .emailVerified(false)
                    .phoneVerified(false)
                    .build();

    User savedUser =
            userRepository.save(user);

    Nurse nurse =
            nurseMapper.toEntity(
                    request,
                    savedUser
            );

    nurse.setHospital(hospital);
    nurse.setStatus(NurseStatus.ACTIVE);

    Nurse savedNurse =
            nurseRepository.save(nurse);

    String emailBody = """
            Welcome to MedCore

            Hello %s,

            You have been appointed as a Nurse at %s.

            Your login credentials are:

            Email: %s
            Temporary Password: %s

            Please log in and change your password after first login.

            Regards,
            MedCore Team
            """.formatted(
            savedUser.getFullName(),
            hospital.getName(),
            savedUser.getEmail(),
            temporaryPassword
    );

    emailOutboxService.createEmail(
            savedUser.getEmail(),
            "Your MedCore Nurse Account",
            emailBody
    );

    return ApiResponse
            .<NurseResponse>builder()
            .success(true)
            .message("Nurse created successfully")
            .data(
                    nurseMapper.toResponse(
                            savedNurse
                    )
            )
            .build();
}

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<NurseResponse> getNurseById(
            Long nurseId) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        Nurse nurse =
                nurseRepository
                        .findByIdAndHospitalIdAndDeletedAtIsNull(
                                nurseId,
                                hospitalId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Nurse not found"
                                ));

        return ApiResponse
                .<NurseResponse>builder()
                .success(true)
                .message("Nurse fetched successfully")
                .data(
                        nurseMapper.toResponse(nurse)
                )
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<NurseResponse>> getAllNurses() {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        List<Nurse> nurses =
                nurseRepository
                        .findByHospitalIdAndDeletedAtIsNull(
                                hospitalId
                        );

        List<NurseResponse> responses =
                nurses.stream()
                        .map(nurseMapper::toResponse)
                        .toList();

        return ApiResponse
                .<List<NurseResponse>>builder()
                .success(true)
                .message("Nurses fetched successfully")
                .data(responses)
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<NurseResponse> updateNurse(
            Long nurseId,
            UpdateNurseRequest request) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        Hospital hospital =
                getActiveHospital(hospitalId);

        Nurse nurse =
                nurseRepository
                        .findByIdAndHospitalIdAndDeletedAtIsNull(
                                nurseId,
                                hospitalId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Nurse not found"
                                ));

        nurseMapper.updateEntity(
                nurse,
                request
        );

        Nurse updatedNurse =
                nurseRepository.save(nurse);

        return ApiResponse
                .<NurseResponse>builder()
                .success(true)
                .message("Nurse updated successfully")
                .data(
                        nurseMapper.toResponse(
                                updatedNurse
                        )
                )
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<Void> deleteNurse(
            Long nurseId) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        Nurse nurse =
                nurseRepository
                        .findByIdAndHospitalIdAndDeletedAtIsNull(
                                nurseId,
                                hospitalId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Nurse not found"
                                ));

        nurse.setDeletedAt(LocalDateTime.now());

        User user = nurse.getUser();
        user.setStatus(UserStatus.INACTIVE);

        nurseRepository.save(nurse);
        userRepository.save(user);

        return ApiResponse
                .<Void>builder()
                .success(true)
                .message("Nurse deleted successfully")
                .data(null)
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<NurseResponse> activateNurse(
            Long nurseId) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        Hospital hospital =
                getActiveHospital(hospitalId);

        Nurse nurse =
                nurseRepository
                        .findByIdAndHospitalIdAndDeletedAtIsNull(
                                nurseId,
                                hospitalId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Nurse not found"
                                ));

        if (nurse.getStatus() == NurseStatus.ACTIVE) {
            throw new BusinessException(
                    "Nurse is already active"
            );
        }

        nurse.setStatus(NurseStatus.ACTIVE);

        Nurse savedNurse =
                nurseRepository.save(nurse);

        return ApiResponse
                .<NurseResponse>builder()
                .success(true)
                .message("Nurse activated successfully")
                .data(
                        nurseMapper.toResponse(
                                savedNurse
                        )
                )
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<NurseResponse> deactivateNurse(
            Long nurseId) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        Hospital hospital =
                getActiveHospital(hospitalId);

        Nurse nurse =
                nurseRepository
                        .findByIdAndHospitalIdAndDeletedAtIsNull(
                                nurseId,
                                hospitalId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Nurse not found"
                                ));

        if (nurse.getStatus() == NurseStatus.INACTIVE) {
            throw new BusinessException(
                    "Nurse is already inactive"
            );
        }

        nurse.setStatus(NurseStatus.INACTIVE);

        Nurse savedNurse =
                nurseRepository.save(nurse);

        return ApiResponse
                .<NurseResponse>builder()
                .success(true)
                .message("Nurse deactivated successfully")
                .data(
                        nurseMapper.toResponse(
                                savedNurse
                        )
                )
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<NurseProfileResponse> getMyProfile() {

        String email =
                SecurityUtil.getCurrentUsername();

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found"
                                ));

        Nurse nurse =
                nurseRepository
                        .findByUserIdAndDeletedAtIsNull(
                                user.getId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Nurse profile not found"
                                ));

        return ApiResponse
                .<NurseProfileResponse>builder()
                .success(true)
                .message("Nurse profile fetched successfully")
                .data(
                        nurseMapper.toProfileResponse(
                                nurse
                        )
                )
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<NurseProfileResponse> updateMyProfile(
            UpdateMyNurseProfileRequest request) {

        String email =
                SecurityUtil.getCurrentUsername();

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found"
                                ));

        Nurse nurse =
                nurseRepository
                        .findByUserIdAndDeletedAtIsNull(
                                user.getId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Nurse profile not found"
                                ));

        nurseMapper.updateMyProfile(
                nurse,
                request
        );

        Nurse updatedNurse =
                nurseRepository.save(nurse);

        return ApiResponse
                .<NurseProfileResponse>builder()
                .success(true)
                .message("Nurse profile updated successfully")
                .data(
                        nurseMapper.toProfileResponse(
                                updatedNurse
                        )
                )
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<NurseProfileResponse> uploadMyProfileImage(
            MultipartFile file) {

        String email =
                SecurityUtil.getCurrentUsername();

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found"
                                ));

        Nurse nurse =
                nurseRepository
                        .findByUserIdAndDeletedAtIsNull(
                                user.getId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Nurse profile not found"
                                ));

        fileValidationService.validateImage(file);

        String imageUrl =
                fileStorageService.upload(
                        file,
                        "medcore/nurses/"
                                + nurse.getId()
                                + "/profile"
                );

        nurse.setProfileImageUrl(imageUrl);

        Nurse updatedNurse =
                nurseRepository.save(nurse);

        return ApiResponse
                .<NurseProfileResponse>builder()
                .success(true)
                .message("Profile image uploaded successfully")
                .data(
                        nurseMapper.toProfileResponse(
                                updatedNurse
                        )
                )
                .build();
    }

    private Hospital getActiveHospital(Long hospitalId) {

        Hospital hospital =
                hospitalRepository
                        .findByIdAndDeletedAtIsNull(hospitalId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Hospital not found"
                                ));

        validateHospitalActive(hospital);

        return hospital;
    }

    private void validateHospitalActive(Hospital hospital) {

        if (hospital.getStatus() != HospitalStatus.ACTIVE) {
            throw new BusinessException(
                    "Hospital is not active"
            );
        }
    }
}