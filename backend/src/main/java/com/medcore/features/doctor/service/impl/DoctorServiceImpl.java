package com.medcore.features.doctor.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.DuplicateResourceException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.PageResponse;
import com.medcore.common.security.SecurityUtil;
import com.medcore.common.security.TenantContextService;
import com.medcore.common.storage.FileStorageService;
import com.medcore.common.storage.FileValidationService;
import com.medcore.features.department.entity.Department;
import com.medcore.features.department.repository.DepartmentRepository;
import com.medcore.features.doctor.dto.request.CreateDoctorRequest;
import com.medcore.features.doctor.dto.request.UpdateDoctorRequest;
import com.medcore.features.doctor.dto.request.UpdateDoctorStatusRequest;
import com.medcore.features.doctor.dto.request.UpdateMyDoctorProfileRequest;
import com.medcore.features.doctor.dto.response.DoctorProfileResponse;
import com.medcore.features.doctor.dto.response.DoctorResponse;
import com.medcore.features.doctor.entity.Doctor;
import com.medcore.features.doctor.mapper.DoctorMapper;
import com.medcore.features.doctor.repository.DoctorRepository;
import com.medcore.features.doctor.service.DoctorService;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.enums.HospitalStatus;
import com.medcore.features.hospital.repository.HospitalRepository;
import com.medcore.features.notification.service.EmailService;
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
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
@Transactional
public class DoctorServiceImpl implements DoctorService {

    private static final Logger log =
            LoggerFactory.getLogger(DoctorServiceImpl.class);

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final DepartmentRepository departmentRepository;
    private final DoctorMapper doctorMapper;
    private final TenantContextService tenantContextService;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final FileStorageService fileStorageService;
    private final FileValidationService fileValidationService;

    private static final Set<String> ALLOWED_SORT_FIELDS =
            Set.of(
                    "id",
                    "specialization",
                    "experienceYears",
                    "consultationFee",
                    "createdAt",
                    "updatedAt"
            );

     

    @Override
    public ApiResponse<DoctorResponse> createDoctor(
            CreateDoctorRequest request) {

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

        String email = request.getEmail().trim().toLowerCase();
        String phone = request.getPhone().trim();

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

        Role doctorRole =
                roleRepository.findByName(RoleName.DOCTOR)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Doctor role not found"
                                ));

        Department department =
                departmentRepository
                        .findByIdAndHospitalIdAndDeletedAtIsNull(
                                request.getDepartmentId(),
                                hospitalId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Department not found"
                                ));

        String temporaryPassword = generateTemporaryPassword();

        User doctorUser = User.builder()
                .fullName(request.getFullName().trim())
                .email(email)
                .phone(phone)
                .password(
                        passwordEncoder.encode(temporaryPassword)
                )
                .hospital(hospital)
                .role(doctorRole)
                .status(UserStatus.ACTIVE)
                .emailVerified(false)
                .phoneVerified(false)
                .build();

        User savedUser = userRepository.save(doctorUser);

        Doctor doctor =
                doctorMapper.toEntity(
                        request,
                        savedUser,
                        hospital,
                        department
                );

        Doctor savedDoctor = doctorRepository.save(doctor);

        emailService.sendDoctorCredentials(
                savedUser.getEmail(),
                savedUser.getFullName(),
                temporaryPassword,
                hospital.getName()
        );

        log.info(
                "Doctor created: doctorId={}, userId={}, hospitalId={}, departmentId={}",
                savedDoctor.getId(),
                savedUser.getId(),
                hospitalId,
                department.getId()
        );

        return ApiResponse.<DoctorResponse>builder()
                .success(true)
                .message("Doctor created successfully")
                .data(doctorMapper.toResponse(savedDoctor))
                .build();
    }

    private String generateTemporaryPassword() {
        return "Temp@" +
                java.util.UUID.randomUUID()
                        .toString()
                        .substring(0, 8);
    }

     

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<DoctorResponse>> getAllDoctors(
            int page,
            int size,
            String sortBy,
            String sortDir) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

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

        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            throw new BusinessException(
                    "Invalid sort field: " + sortBy
            );
        }

        sortDir = sortDir.trim().toLowerCase();

        if (!sortDir.equals("asc") && !sortDir.equals("desc")) {
            throw new BusinessException(
                    "Sort direction must be 'asc' or 'desc'"
            );
        }

        Sort sort = sortDir.equals("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Doctor> doctorPage;

        if (hospitalId == null) {
            doctorPage = doctorRepository
                    .findByDeletedAtIsNull(pageable);
        } else {
            doctorPage = doctorRepository
                    .findByHospitalIdAndDeletedAtIsNull(
                            hospitalId,
                            pageable
                    );
        }

        List<DoctorResponse> items =
                doctorPage.getContent()
                        .stream()
                        .map(doctorMapper::toResponse)
                        .toList();

        PageResponse<DoctorResponse> response =
                PageResponse.<DoctorResponse>builder()
                        .items(items)
                        .page(doctorPage.getNumber())
                        .size(doctorPage.getSize())
                        .totalElements(doctorPage.getTotalElements())
                        .totalPages(doctorPage.getTotalPages())
                        .first(doctorPage.isFirst())
                        .last(doctorPage.isLast())
                        .hasNext(doctorPage.hasNext())
                        .hasPrevious(doctorPage.hasPrevious())
                        .build();

        return ApiResponse.<PageResponse<DoctorResponse>>builder()
                .success(true)
                .message("Doctors fetched successfully")
                .data(response)
                .build();
    }

     

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<DoctorResponse> getDoctorById(Long doctorId) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        Doctor doctor;

        if (hospitalId == null) {
            doctor = doctorRepository
                    .findByIdAndDeletedAtIsNull(doctorId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Doctor not found"
                            ));
        } else {
            doctor = doctorRepository
                    .findByIdAndHospitalIdAndDeletedAtIsNull(
                            doctorId,
                            hospitalId
                    )
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Doctor not found"
                            ));
        }

        return ApiResponse.<DoctorResponse>builder()
                .success(true)
                .message("Doctor fetched successfully")
                .data(doctorMapper.toResponse(doctor))
                .build();
    }

    
    @Override
    public ApiResponse<DoctorResponse> updateDoctor(
            Long doctorId,
            UpdateDoctorRequest request) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        Doctor doctor;

        if (hospitalId == null) {
            doctor = doctorRepository
                    .findByIdAndDeletedAtIsNull(doctorId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Doctor not found"
                            ));
        } else {
            doctor = doctorRepository
                    .findByIdAndHospitalIdAndDeletedAtIsNull(
                            doctorId,
                            hospitalId
                    )
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Doctor not found"
                            ));
        }

        doctorMapper.updateEntity(doctor, request);

        Doctor updatedDoctor = doctorRepository.save(doctor);

        log.info(
                "Doctor updated: doctorId={}, hospitalId={}",
                doctorId,
                hospitalId
        );

        return ApiResponse.<DoctorResponse>builder()
                .success(true)
                .message("Doctor updated successfully")
                .data(doctorMapper.toResponse(updatedDoctor))
                .build();
    }

    

    @Override
    public ApiResponse<DoctorResponse> updateDoctorStatus(
            Long doctorId,
            UpdateDoctorStatusRequest request) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        Doctor doctor;

        if (hospitalId == null) {
            doctor = doctorRepository
                    .findByIdAndDeletedAtIsNull(doctorId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Doctor not found"
                            ));
        } else {
            doctor = doctorRepository
                    .findByIdAndHospitalIdAndDeletedAtIsNull(
                            doctorId,
                            hospitalId
                    )
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Doctor not found"
                            ));
        }

        doctor.setStatus(request.getStatus());

        Doctor updatedDoctor = doctorRepository.save(doctor);

        log.info(
                "Doctor status updated: doctorId={}, hospitalId={}, status={}",
                doctorId,
                hospitalId,
                updatedDoctor.getStatus()
        );

        return ApiResponse.<DoctorResponse>builder()
                .success(true)
                .message("Doctor status updated successfully")
                .data(doctorMapper.toResponse(updatedDoctor))
                .build();
    }

     

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<DoctorResponse>> searchDoctors(
            String keyword,
            int page,
            int size) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        if (keyword == null || keyword.trim().isEmpty()) {
            throw new BusinessException(
                    "Search keyword cannot be empty"
            );
        }

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

        String normalizedKeyword = keyword.trim();
        Pageable pageable = PageRequest.of(page, size);

        Page<Doctor> doctorPage;

        if (hospitalId == null) {
            doctorPage = doctorRepository
                    .findBySpecializationContainingIgnoreCaseAndDeletedAtIsNull(
                            normalizedKeyword,
                            pageable
                    );
        } else {
            doctorPage = doctorRepository
                    .findByHospitalIdAndSpecializationContainingIgnoreCaseAndDeletedAtIsNull(
                            hospitalId,
                            normalizedKeyword,
                            pageable
                    );
        }

        List<DoctorResponse> items =
                doctorPage.getContent()
                        .stream()
                        .map(doctorMapper::toResponse)
                        .toList();

        PageResponse<DoctorResponse> response =
                PageResponse.<DoctorResponse>builder()
                        .items(items)
                        .page(doctorPage.getNumber())
                        .size(doctorPage.getSize())
                        .totalElements(doctorPage.getTotalElements())
                        .totalPages(doctorPage.getTotalPages())
                        .first(doctorPage.isFirst())
                        .last(doctorPage.isLast())
                        .hasNext(doctorPage.hasNext())
                        .hasPrevious(doctorPage.hasPrevious())
                        .build();

        return ApiResponse.<PageResponse<DoctorResponse>>builder()
                .success(true)
                .message("Doctors fetched successfully")
                .data(response)
                .build();
    }

    
    @Override
    public ApiResponse<String> deleteDoctor(Long doctorId) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        Doctor doctor;

        if (hospitalId == null) {
            doctor = doctorRepository
                    .findByIdAndDeletedAtIsNull(doctorId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Doctor not found"
                            ));
        } else {
            doctor = doctorRepository
                    .findByIdAndHospitalIdAndDeletedAtIsNull(
                            doctorId,
                            hospitalId
                    )
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Doctor not found"
                            ));
        }

        doctor.setDeletedAt(LocalDateTime.now());
        doctorRepository.save(doctor);

        log.info(
                "Doctor deleted: doctorId={}, hospitalId={}",
                doctorId,
                hospitalId
        );

        return ApiResponse.<String>builder()
                .success(true)
                .message("Doctor deleted successfully")
                .data("Deleted")
                .build();
    }

    
    @Override
    public ApiResponse<String> restoreDoctor(Long doctorId) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        Doctor doctor;

        if (hospitalId == null) {
            doctor = doctorRepository
                    .findById(doctorId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Doctor not found"
                            ));
        } else {
            doctor = doctorRepository
                    .findByIdAndHospitalId(doctorId, hospitalId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Doctor not found"
                            ));
        }

        if (doctor.getDeletedAt() == null) {
            throw new BusinessException(
                    "Doctor is already active"
            );
        }

        doctor.setDeletedAt(null);
        doctorRepository.save(doctor);

        log.info(
                "Doctor restored: doctorId={}, hospitalId={}",
                doctorId,
                hospitalId
        );

        return ApiResponse.<String>builder()
                .success(true)
                .message("Doctor restored successfully")
                .data("Restored")
                .build();
    }

    

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<DoctorProfileResponse> getMyProfile() {

        String email = SecurityUtil.getCurrentUsername();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        Doctor doctor = doctorRepository
                .findByUserIdAndDeletedAtIsNull(user.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Doctor profile not found"
                        )
                );

        return ApiResponse.<DoctorProfileResponse>builder()
                .success(true)
                .message("Doctor profile fetched successfully")
                .data(doctorMapper.toProfileResponse(doctor))
                .build();
    }

    
    @Override
    public ApiResponse<DoctorProfileResponse> updateMyProfile(
            UpdateMyDoctorProfileRequest request) {

        String email = SecurityUtil.getCurrentUsername();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        Doctor doctor = doctorRepository
                .findByUserIdAndDeletedAtIsNull(user.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Doctor profile not found"
                        )
                );

        if (request.getConsultationFee() != null) {
            doctor.setConsultationFee(request.getConsultationFee());
        }

        if (request.getBio() != null) {
            doctor.setBio(request.getBio().trim());
        }

        if (request.getLanguages() != null) {
            doctor.setLanguages(request.getLanguages().trim());
        }

        Doctor updatedDoctor = doctorRepository.save(doctor);

        return ApiResponse.<DoctorProfileResponse>builder()
                .success(true)
                .message("Doctor profile updated successfully")
                .data(doctorMapper.toProfileResponse(updatedDoctor))
                .build();
    }

    

    @Override
    public ApiResponse<DoctorProfileResponse> uploadMyProfileImage(
            MultipartFile file) {

        String email = SecurityUtil.getCurrentUsername();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        Doctor doctor = doctorRepository
                .findByUserIdAndDeletedAtIsNull(user.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Doctor profile not found"
                        )
                );

        fileValidationService.validateImage(file);

        String imageUrl = fileStorageService.upload(
                file,
                "medcore/doctors/" + doctor.getId() + "/profile"
        );

        doctor.setProfileImageUrl(imageUrl);

        Doctor updatedDoctor = doctorRepository.save(doctor);

        return ApiResponse.<DoctorProfileResponse>builder()
                .success(true)
                .message("Profile image uploaded successfully")
                .data(doctorMapper.toProfileResponse(updatedDoctor))
                .build();
    }
}