package com.medcore.features.receptionist.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.DuplicateResourceException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.PageResponse;
import com.medcore.common.security.SecurityUtil;
import com.medcore.common.security.TenantContextService;
import com.medcore.common.storage.FileStorageService;
import com.medcore.common.storage.FileValidationService;
import com.medcore.common.util.PasswordGenerator;

import com.medcore.features.appointment.dto.response.AppointmentResponse;
import com.medcore.features.appointment.service.AppointmentService;

import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.enums.HospitalStatus;
import com.medcore.features.hospital.repository.HospitalRepository;
import com.medcore.features.notification.enums.EmailType;
import com.medcore.features.notification.service.EmailOutboxService;

import com.medcore.features.patient.dto.request.CreatePatientRequest;
import com.medcore.features.patient.dto.response.PatientResponse;
import com.medcore.features.patient.entity.Patient;
import com.medcore.features.patient.enums.PatientStatus;
import com.medcore.features.patient.mapper.PatientMapper;
import com.medcore.features.patient.repository.PatientRepository;
import com.medcore.features.patient.service.PatientService;

import com.medcore.features.receptionist.dto.request.CreateReceptionistRequest;
import com.medcore.features.receptionist.dto.request.CreateWalkInPatientRequest;
import com.medcore.features.receptionist.dto.request.UpdateMyReceptionistProfileRequest;
import com.medcore.features.receptionist.dto.request.UpdateReceptionistRequest;
import com.medcore.features.receptionist.dto.response.ReceptionistProfileResponse;
import com.medcore.features.receptionist.dto.response.ReceptionistResponse;
import com.medcore.features.receptionist.entity.Receptionist;
import com.medcore.features.receptionist.enums.ReceptionistStatus;
import com.medcore.features.receptionist.mapper.ReceptionistMapper;
import com.medcore.features.receptionist.repository.ReceptionistRepository;
import com.medcore.features.receptionist.service.ReceptionistService;

import com.medcore.features.user.entity.Role;
import com.medcore.features.user.entity.User;
import com.medcore.features.user.enums.RoleName;
import com.medcore.features.user.enums.UserStatus;
import com.medcore.features.user.repository.RoleRepository;
import com.medcore.features.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReceptionistServiceImpl implements ReceptionistService {

    private final ReceptionistRepository receptionistRepository;
    private final UserRepository userRepository;
    private final ReceptionistMapper receptionistMapper;

    private final PatientService patientService;
    private final AppointmentService appointmentService;

    private final TenantContextService tenantContextService;
    private final HospitalRepository hospitalRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailOutboxService emailOutboxService;

    private final FileStorageService fileStorageService;
    private final FileValidationService fileValidationService;

    private final PatientRepository patientRepository;
    private final PatientMapper patientMapper;

    @Override
    @Transactional
    public ApiResponse<ReceptionistResponse> createReceptionist(
            CreateReceptionistRequest request) {

        Long hospitalId = getCurrentHospitalId();

        Hospital hospital = getActiveHospital(hospitalId);

        String email = request.getEmail().trim().toLowerCase();
        String phone = request.getPhone().trim();

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

        Role receptionistRole = roleRepository
                .findByName(RoleName.RECEPTIONIST)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Receptionist role not found"
                        ));

        String temporaryPassword = PasswordGenerator.generate();

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(email)
                .phone(phone)
                .password(passwordEncoder.encode(temporaryPassword))
                .hospital(hospital)
                .role(receptionistRole)
                .status(UserStatus.PENDING_VERIFICATION)
                .emailVerified(false)
                .phoneVerified(false)
                .build();

        User savedUser = userRepository.save(user);

        Receptionist receptionist = receptionistMapper.toEntity(
                request,
                savedUser
        );

        receptionist.setHospital(hospital);
        receptionist.setStatus(ReceptionistStatus.ACTIVE);

        Receptionist savedReceptionist =
                receptionistRepository.save(receptionist);

        String emailBody = """
                Welcome to MedCore.

                Your receptionist account has been created.

                Name: %s
                Email: %s
                Temporary Password: %s
                Hospital: %s

                Please change your password after your first login.
                """.formatted(
                savedUser.getFullName(),
                savedUser.getEmail(),
                temporaryPassword,
                hospital.getName()
        );

        emailOutboxService.createEmail(
                savedUser,
                EmailType.RECEPTIONIST_CREDENTIALS,
                savedUser.getEmail(),
                "Your MedCore Receptionist Account",
                emailBody,
                1
        );
        return ApiResponse.<ReceptionistResponse>builder()
                .success(true)
                .message("Receptionist created successfully")
                .data(receptionistMapper.toResponse(savedReceptionist))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<ReceptionistResponse> getReceptionistById(
            Long receptionistId) {

        Receptionist receptionist = getReceptionist(receptionistId);

        validateHospitalAccess(receptionist);

        return ApiResponse.<ReceptionistResponse>builder()
                .success(true)
                .message("Receptionist fetched successfully")
                .data(receptionistMapper.toResponse(receptionist))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<ReceptionistResponse>>
    getAllReceptionists(
            int page,
            int size,
            String sortBy,
            String sortDir) {

        Long hospitalId = getCurrentHospitalId();

        Sort.Direction direction =
                sortDir.equalsIgnoreCase("desc")
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(direction, sortBy)
        );

        Page<Receptionist> receptionistPage =
                receptionistRepository
                        .findByHospitalIdAndDeletedAtIsNull(
                                hospitalId,
                                pageable
                        );

        List<ReceptionistResponse> items =
                receptionistPage
                        .getContent()
                        .stream()
                        .map(receptionistMapper::toResponse)
                        .toList();

        PageResponse<ReceptionistResponse> pageResponse =
                PageResponse.<ReceptionistResponse>builder()
                        .items(items)
                        .page(receptionistPage.getNumber())
                        .size(receptionistPage.getSize())
                        .totalElements(
                                receptionistPage.getTotalElements()
                        )
                        .totalPages(
                                receptionistPage.getTotalPages()
                        )
                        .first(receptionistPage.isFirst())
                        .last(receptionistPage.isLast())
                        .hasNext(receptionistPage.hasNext())
                        .hasPrevious(receptionistPage.hasPrevious())
                        .build();

        return ApiResponse
                .<PageResponse<ReceptionistResponse>>builder()
                .success(true)
                .message("Receptionists fetched successfully")
                .data(pageResponse)
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<ReceptionistResponse> updateReceptionist(
            Long receptionistId,
            UpdateReceptionistRequest request) {

        Receptionist receptionist = getReceptionist(receptionistId);

        validateHospitalAccess(receptionist);

        getActiveHospital(
                receptionist.getHospital().getId()
        );

        receptionistMapper.updateEntity(
                receptionist,
                request
        );

        Receptionist updatedReceptionist =
                receptionistRepository.save(receptionist);

        return ApiResponse.<ReceptionistResponse>builder()
                .success(true)
                .message("Receptionist updated successfully")
                .data(
                        receptionistMapper.toResponse(
                                updatedReceptionist
                        )
                )
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<Void> deleteReceptionist(
            Long receptionistId) {

        Receptionist receptionist =
                getReceptionist(receptionistId);

        validateHospitalAccess(receptionist);

        receptionist.setDeletedAt(LocalDateTime.now());
        receptionist.setStatus(ReceptionistStatus.INACTIVE);

        User user = receptionist.getUser();
        user.setStatus(UserStatus.INACTIVE);

        receptionistRepository.save(receptionist);
        userRepository.save(user);

        return ApiResponse.<Void>builder()
                .success(true)
                .message("Receptionist deleted successfully")
                .data(null)
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<ReceptionistResponse>
    activateReceptionist(Long receptionistId) {

        Receptionist receptionist =
                getReceptionist(receptionistId);

        validateHospitalAccess(receptionist);

        getActiveHospital(
                receptionist.getHospital().getId()
        );

        if (receptionist.getStatus()
                == ReceptionistStatus.ACTIVE) {

            throw new BusinessException(
                    "Receptionist is already active"
            );
        }

        receptionist.setStatus(
                ReceptionistStatus.ACTIVE
        );

        User user = receptionist.getUser();
        user.setStatus(UserStatus.ACTIVE);

        Receptionist savedReceptionist =
                receptionistRepository.save(receptionist);

        userRepository.save(user);

        return ApiResponse.<ReceptionistResponse>builder()
                .success(true)
                .message("Receptionist activated successfully")
                .data(
                        receptionistMapper.toResponse(
                                savedReceptionist
                        )
                )
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<ReceptionistResponse>
    deactivateReceptionist(Long receptionistId) {

        Receptionist receptionist =
                getReceptionist(receptionistId);

        validateHospitalAccess(receptionist);

        getActiveHospital(
                receptionist.getHospital().getId()
        );

        if (receptionist.getStatus()
                == ReceptionistStatus.INACTIVE) {

            throw new BusinessException(
                    "Receptionist is already inactive"
            );
        }

        receptionist.setStatus(
                ReceptionistStatus.INACTIVE
        );

        User user = receptionist.getUser();
        user.setStatus(UserStatus.INACTIVE);

        Receptionist savedReceptionist =
                receptionistRepository.save(receptionist);

        userRepository.save(user);

        return ApiResponse.<ReceptionistResponse>builder()
                .success(true)
                .message("Receptionist deactivated successfully")
                .data(
                        receptionistMapper.toResponse(
                                savedReceptionist
                        )
                )
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<PatientResponse> registerPatient(
            CreatePatientRequest request) {

        validateActiveReceptionist();

        return patientService.createPatient(request);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<PatientResponse>> getRecentPatients(
            int limit) {

        Receptionist receptionist =
                validateActiveReceptionist();

        Long hospitalId =
                receptionist.getHospital().getId();

        int safeLimit =
                Math.max(1, Math.min(limit, 20));

        Pageable pageable = PageRequest.of(
                0,
                safeLimit,
                Sort.by(
                        Sort.Direction.DESC,
                        "createdAt"
                )
        );

        List<PatientResponse> items =
                patientRepository
                        .findRecentForHospital(
                                hospitalId,
                                pageable
                        )
                        .getContent()
                        .stream()
                        .map(patientMapper::toResponse)
                        .toList();

        return ApiResponse.<List<PatientResponse>>builder()
                .success(true)
                .message("Recent patients fetched successfully")
                .data(items)
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<PatientResponse> registerWalkInPatient(
            CreateWalkInPatientRequest request) {

        Receptionist receptionist =
                validateActiveReceptionist();

        Hospital hospital =
                receptionist.getHospital();

        String email =
                (request.getEmail() != null
                        && !request.getEmail().isBlank())
                        ? request.getEmail()
                        .trim()
                        .toLowerCase()
                        : request.getPhone()
                        .trim()
                        + "@walkin.medcore.local";

        String phone =
                request.getPhone().trim();

        if (userRepository.existsByEmail(email)) {
            throw new BusinessException(
                    "A user with this email already exists"
            );
        }

        if (userRepository.existsByPhone(phone)) {
            throw new BusinessException(
                    "A user with this phone already exists"
            );
        }

        Role patientRole =
                roleRepository
                        .findByName(RoleName.PATIENT)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Patient role not found"
                                ));

        String tempPassword =
                PasswordGenerator.generate();

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(email)
                .phone(phone)
                .password(
                        passwordEncoder.encode(tempPassword)
                )
                .hospital(hospital)
                .role(patientRole)
                .status(UserStatus.ACTIVE)
                .emailVerified(false)
                .phoneVerified(false)
                .build();

        User savedUser =
                userRepository.save(user);

        Patient patient = Patient.builder()
                .user(savedUser)
                .dateOfBirth(request.getDateOfBirth())
                .bloodGroup(request.getBloodGroup())
                .emergencyContactName(
                        request.getEmergencyContactName()
                )
                .emergencyContactPhone(
                        request.getEmergencyContactPhone()
                )
                .emergencyContactRelation(
                        request.getEmergencyContactRelation()
                )
                .status(PatientStatus.ACTIVE)
                .build();

        Patient savedPatient =
                patientRepository.save(patient);

        return ApiResponse.<PatientResponse>builder()
                .success(true)
                .message(
                        "Walk-in patient registered successfully"
                )
                .data(patientMapper.toResponse(savedPatient))
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<AppointmentResponse> checkInPatient(
            Long appointmentId) {

        validateActiveReceptionist();

        return appointmentService.checkInAppointment(
                appointmentId
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<AppointmentResponse>>
    getTodayAppointments(
            int page,
            int size,
            String sortBy,
            String sortDir) {

        validateActiveReceptionist();

        return appointmentService.getTodayAppointments(
                page,
                size,
                sortBy,
                sortDir
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<PatientResponse>>
    searchPatients(
            String keyword,
            int page,
            int size) {

        validateActiveReceptionist();

        return patientService.searchPatients(
                keyword,
                page,
                size
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<ReceptionistProfileResponse>
    getMyProfile() {

        Receptionist receptionist =
                validateActiveReceptionist();

        return ApiResponse.<ReceptionistProfileResponse>builder()
                .success(true)
                .message(
                        "Receptionist profile fetched successfully"
                )
                .data(
                        receptionistMapper.toProfileResponse(
                                receptionist
                        )
                )
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<ReceptionistProfileResponse>
    updateMyProfile(
            UpdateMyReceptionistProfileRequest request) {

        Receptionist receptionist =
                validateActiveReceptionist();

        receptionistMapper.updateMyProfile(
                receptionist,
                request
        );

        Receptionist updatedReceptionist =
                receptionistRepository.save(
                        receptionist
                );

        return ApiResponse.<ReceptionistProfileResponse>builder()
                .success(true)
                .message(
                        "Receptionist profile updated successfully"
                )
                .data(
                        receptionistMapper.toProfileResponse(
                                updatedReceptionist
                        )
                )
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<ReceptionistProfileResponse>
    uploadMyProfileImage(
            MultipartFile file) {

        Receptionist receptionist =
                validateActiveReceptionist();

        fileValidationService.validateImage(file);

        String imageUrl =
                fileStorageService.upload(
                        file,
                        "medcore/receptionists/"
                                + receptionist.getId()
                                + "/profile"
                );

        receptionist.setProfileImageUrl(imageUrl);

        Receptionist updatedReceptionist =
                receptionistRepository.save(
                        receptionist
                );

        return ApiResponse.<ReceptionistProfileResponse>builder()
                .success(true)
                .message(
                        "Profile image uploaded successfully"
                )
                .data(
                        receptionistMapper.toProfileResponse(
                                updatedReceptionist
                        )
                )
                .build();
    }

    private Receptionist getReceptionist(
            Long receptionistId) {

        return receptionistRepository
                .findByIdAndDeletedAtIsNull(
                        receptionistId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Receptionist not found"
                        ));
    }

    private Receptionist getCurrentReceptionist() {

        String email =
                SecurityUtil.getCurrentUsername();

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found"
                                ));

        return receptionistRepository
                .findByUserIdAndDeletedAtIsNull(
                        user.getId()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Receptionist profile not found"
                        ));
    }

    private void validateHospitalAccess(
            Receptionist receptionist) {

        Long hospitalId =
                getCurrentHospitalId();

        if (receptionist.getHospital() == null
                || !receptionist
                .getHospital()
                .getId()
                .equals(hospitalId)) {

            throw new BusinessException(
                    "You are not authorized to access this hospital data"
            );
        }
    }

    private Receptionist validateActiveReceptionist() {

        Long hospitalId =
                getCurrentHospitalId();

        User currentUser =
                getCurrentUser();

        Receptionist receptionist =
                receptionistRepository
                        .findByUserIdAndDeletedAtIsNull(
                                currentUser.getId()
                        )
                        .orElseThrow(() ->
                                new BusinessException(
                                        "Only receptionists can perform this action"
                                ));

        if (receptionist.getHospital() == null
                || !receptionist
                .getHospital()
                .getId()
                .equals(hospitalId)) {

            throw new BusinessException(
                    "You are not authorized to access this hospital data"
            );
        }

        if (receptionist.getStatus()
                != ReceptionistStatus.ACTIVE) {

            throw new BusinessException(
                    "Inactive receptionists cannot perform this action"
            );
        }

        return receptionist;
    }

    private Hospital getActiveHospital(Long hospitalId) {

        return hospitalRepository
                .findByIdAndDeletedAtIsNull(hospitalId)
                .filter(hospital ->
                        hospital.getStatus()
                                == HospitalStatus.ACTIVE)
                .orElseThrow(() ->
                        new BusinessException(
                                "Hospital is not active"
                        ));
    }

    private Long getCurrentHospitalId() {

        Long hospitalId =
                tenantContextService
                        .getCurrentHospitalId();

        if (hospitalId == null) {
            throw new BusinessException(
                    "User is not associated with a hospital"
            );
        }

        return hospitalId;
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
}