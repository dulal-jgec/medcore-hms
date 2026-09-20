package com.medcore.features.nurse.service.impl;

import com.medcore.common.exception.BusinessException;

import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
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
import com.medcore.features.user.entity.User;
import com.medcore.features.user.enums.UserStatus;
import com.medcore.features.user.repository.RoleRepository;
import com.medcore.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.medcore.common.security.SecurityUtil;
import com.medcore.common.security.TenantContextService;
import com.medcore.common.storage.FileStorageService;
import com.medcore.common.storage.FileValidationService;
import com.medcore.common.util.PasswordGenerator;
import com.medcore.features.hospital.entity.Hospital;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import com.medcore.features.hospital.repository.HospitalRepository;
import com.medcore.features.notification.service.EmailService;
import com.medcore.features.user.entity.Role;
import com.medcore.features.user.enums.RoleName;


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
    private final EmailService emailService;
    private final FileStorageService fileStorageService;
    private final FileValidationService fileValidationService; 
    
@Override
@Transactional
public ApiResponse<NurseResponse> createNurse(
        CreateNurseRequest request) {

    //  Get current hospital from logged-in Hospital Admin
    Long hospitalId =
            tenantContextService.getCurrentHospitalId();

    Hospital hospital =
            hospitalRepository
                    .findByIdAndDeletedAtIsNull(hospitalId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Hospital not found"
                            ));

    //  Check email uniqueness
    if (userRepository.existsByEmail(request.getEmail())) {
        throw new BusinessException(
                "Email already exists"
        );
    }

    //  Check phone uniqueness
    if (userRepository.existsByPhone(request.getPhone())) {
        throw new BusinessException(
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

    //  Generate temporary password
    String temporaryPassword =
            PasswordGenerator.generate();

    // Create User
    User user = User.builder()
            .fullName(request.getFullName().trim())
            .email(request.getEmail().trim().toLowerCase())
            .phone(request.getPhone().trim())
            .password(passwordEncoder.encode(temporaryPassword))
            .hospital(hospital)
            .role(nurseRole)
            .status(UserStatus.ACTIVE)
            .emailVerified(false)
            .phoneVerified(false)
            .build();

    User savedUser =
            userRepository.save(user);

    // Create Nurse profile
    Nurse nurse =
            nurseMapper.toEntity(
                    request,
                    savedUser
            );

    nurse.setHospital(hospital);
    nurse.setStatus(NurseStatus.ACTIVE);

    Nurse savedNurse =
            nurseRepository.save(nurse);

    //  Send login credentials
    emailService.sendNurseCredentials(
            savedUser.getEmail(),
            savedUser.getFullName(),
            temporaryPassword,
            hospital.getName()
    );

    //  Return response
    return ApiResponse.<NurseResponse>builder()
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

    return ApiResponse.<NurseResponse>builder()
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

    return ApiResponse.<List<NurseResponse>>builder()
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

    return ApiResponse.<NurseResponse>builder()
            .success(true)
            .message("Nurse updated successfully")
            .data(
                    nurseMapper.toResponse(updatedNurse)
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

    nurseRepository.save(nurse);

    return ApiResponse.<Void>builder()
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

    return ApiResponse.<NurseResponse>builder()
            .success(true)
            .message("Nurse activated successfully")
            .data(
                    nurseMapper.toResponse(savedNurse)
            )
            .build();
}

 

@Override
@Transactional
public ApiResponse<NurseResponse> deactivateNurse(
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

    if (nurse.getStatus() == NurseStatus.INACTIVE) {
        throw new BusinessException(
                "Nurse is already inactive"
        );
    }

    nurse.setStatus(NurseStatus.INACTIVE);

    Nurse savedNurse =
            nurseRepository.save(nurse);

    return ApiResponse.<NurseResponse>builder()
            .success(true)
            .message("Nurse deactivated successfully")
            .data(
                    nurseMapper.toResponse(savedNurse)
            )
            .build();
}
	

@Override
@Transactional(readOnly = true)
public ApiResponse<NurseProfileResponse> getMyProfile() {

    String email = SecurityUtil.getCurrentUsername();

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

    return ApiResponse.<NurseProfileResponse>builder()
            .success(true)
            .message("Nurse profile fetched successfully")
            .data(
                    nurseMapper.toProfileResponse(nurse)
            )
            .build();
}
     
@Override
@Transactional
public ApiResponse<NurseProfileResponse> updateMyProfile(
        UpdateMyNurseProfileRequest request) {

    String email = SecurityUtil.getCurrentUsername();

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

    return ApiResponse.<NurseProfileResponse>builder()
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

    String email = SecurityUtil.getCurrentUsername();

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

    return ApiResponse.<NurseProfileResponse>builder()
            .success(true)
            .message("Profile image uploaded successfully")
            .data(
                    nurseMapper.toProfileResponse(
                            updatedNurse
                    )
            )
            .build();
}
}