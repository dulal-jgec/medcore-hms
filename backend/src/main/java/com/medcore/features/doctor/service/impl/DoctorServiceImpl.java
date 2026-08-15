package com.medcore.features.doctor.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.DuplicateResourceException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.PageResponse;
import com.medcore.common.security.TenantContextService;
import com.medcore.features.department.entity.Department;
import com.medcore.features.department.repository.DepartmentRepository;
import com.medcore.features.doctor.dto.request.CreateDoctorRequest;
import com.medcore.features.doctor.dto.request.UpdateDoctorRequest;
import com.medcore.features.doctor.dto.request.UpdateDoctorStatusRequest;
import com.medcore.features.doctor.dto.response.DoctorResponse;
import com.medcore.features.doctor.entity.Doctor;
import com.medcore.features.doctor.mapper.DoctorMapper;
import com.medcore.features.doctor.repository.DoctorRepository;
import com.medcore.features.doctor.service.DoctorService;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.repository.HospitalRepository;
import com.medcore.features.user.entity.User;
import com.medcore.features.user.enums.RoleName;
import com.medcore.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final DepartmentRepository departmentRepository;
    private final DoctorMapper doctorMapper;
    private final TenantContextService tenantContextService;

    private static final Set<String> ALLOWED_SORT_FIELDS =
            Set.of(
                    "id",
                    "specialization",
                    "experienceYears",
                    "consultationFee",
                    "createdAt",
                    "updatedAt"
            );

 
    // CREATE DOCTOR
    

    @Override
    public ApiResponse<DoctorResponse> createDoctor(
            CreateDoctorRequest request) {

        Long currentHospitalId =
                tenantContextService.getCurrentHospitalId();

        Long hospitalId;

        /*
         * SUPER_ADMIN
         * → can create doctor for any hospital
         *
         * HOSPITAL_ADMIN
         * → can create doctor only for own hospital
         */
        if (currentHospitalId == null) {

            hospitalId = request.getHospitalId();

        } else {

            if (!request.getHospitalId().equals(currentHospitalId)) {
                throw new BusinessException(
                        "You cannot create a doctor for another hospital"
                );
            }

            hospitalId = currentHospitalId;
        }

  
        // Validate hospital
         

        Hospital hospital = hospitalRepository
                .findByIdAndDeletedAtIsNull(hospitalId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Hospital not found"
                        )
                );

 
        // Validate user
       

        User user = userRepository
                .findById(request.getUserId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );

        if (user.getRole().getName() != RoleName.DOCTOR) {

            throw new BusinessException(
                    "Selected user is not assigned the DOCTOR role"
            );
        }

    
        // Prevent duplicate doctor profile
        

        if (doctorRepository.existsByUserId(user.getId())) {

            throw new DuplicateResourceException(
                    "Doctor profile already exists for this user"
            );
        }

   
        // Validate department
         

        Department department = departmentRepository
                .findByIdAndDeletedAtIsNull(
                        request.getDepartmentId()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Department not found"
                        )
                );

        // Department must belong to selected hospital
        if (!department.getHospital()
                .getId()
                .equals(hospitalId)) {

            throw new BusinessException(
                    "Department does not belong to the selected hospital"
            );
        }

    
        // Validate user's hospital
        
        if (user.getHospital() == null ||
                !user.getHospital()
                        .getId()
                        .equals(hospitalId)) {

            throw new BusinessException(
                    "User does not belong to the selected hospital"
            );
        }

      
        // Create doctor
        

        Doctor doctor = doctorMapper.toEntity(
                request,
                user,
                hospital,
                department
        );

        Doctor savedDoctor =
                doctorRepository.save(doctor);

        return ApiResponse.<DoctorResponse>builder()
                .success(true)
                .message("Doctor created successfully")
                .data(doctorMapper.toResponse(savedDoctor))
                .build();
    }

  
    // GET ALL DOCTORS
    

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<DoctorResponse>> getAllDoctors(
            int page,
            int size,
            String sortBy,
            String sortDir) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

         
        // Pagination validation
 
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

         // Sorting validation
        

        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            throw new BusinessException(
                    "Invalid sort field: " + sortBy
            );
        }

        sortDir = sortDir.trim().toLowerCase();

        if (!sortDir.equals("asc")
                && !sortDir.equals("desc")) {

            throw new BusinessException(
                    "Sort direction must be 'asc' or 'desc'"
            );
        }

        Sort sort = sortDir.equals("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable =
                PageRequest.of(page, size, sort);

 
        // Tenant-aware query
        

        Page<Doctor> doctorPage;

        if (hospitalId == null) {

            // SUPER_ADMIN
            doctorPage =
                    doctorRepository
                            .findByDeletedAtIsNull(pageable);

        } else {

            // HOSPITAL_ADMIN
            doctorPage =
                    doctorRepository
                            .findByHospitalIdAndDeletedAtIsNull(
                                    hospitalId,
                                    pageable
                            );
        }

 
        // Map response
       

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
                        .totalElements(
                                doctorPage.getTotalElements()
                        )
                        .totalPages(
                                doctorPage.getTotalPages()
                        )
                        .first(doctorPage.isFirst())
                        .last(doctorPage.isLast())
                        .hasNext(doctorPage.hasNext())
                        .hasPrevious(
                                doctorPage.hasPrevious()
                        )
                        .build();

        return ApiResponse.<PageResponse<DoctorResponse>>builder()
                .success(true)
                .message("Doctors fetched successfully")
                .data(response)
                .build();
    }

 
    // GET DOCTOR BY ID
  

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<DoctorResponse> getDoctorById(
            Long doctorId) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        Doctor doctor;

        if (hospitalId == null) {

            // SUPER_ADMIN
            doctor = doctorRepository
                    .findByIdAndDeletedAtIsNull(doctorId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Doctor not found"
                            )
                    );

        } else {

            // HOSPITAL_ADMIN
            doctor = doctorRepository
                    .findByIdAndHospitalIdAndDeletedAtIsNull(
                            doctorId,
                            hospitalId
                    )
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Doctor not found"
                            )
                    );
        }

        return ApiResponse.<DoctorResponse>builder()
                .success(true)
                .message("Doctor fetched successfully")
                .data(doctorMapper.toResponse(doctor))
                .build();
    }

     
    // UPDATE DOCTOR
  

    @Override
    public ApiResponse<DoctorResponse> updateDoctor(
            Long doctorId,
            UpdateDoctorRequest request) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        Doctor doctor;

        if (hospitalId == null) {

            // SUPER_ADMIN
            doctor = doctorRepository
                    .findByIdAndDeletedAtIsNull(doctorId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Doctor not found"
                            )
                    );

        } else {

            // HOSPITAL_ADMIN
            doctor = doctorRepository
                    .findByIdAndHospitalIdAndDeletedAtIsNull(
                            doctorId,
                            hospitalId
                    )
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Doctor not found"
                            )
                    );
        }

        doctorMapper.updateEntity(
                doctor,
                request
        );

        Doctor updatedDoctor =
                doctorRepository.save(doctor);

        return ApiResponse.<DoctorResponse>builder()
                .success(true)
                .message("Doctor updated successfully")
                .data(doctorMapper.toResponse(updatedDoctor))
                .build();
    }

     // UPDATE DOCTOR STATUS
    
    @Override
    public ApiResponse<DoctorResponse> updateDoctorStatus(
            Long doctorId,
            UpdateDoctorStatusRequest request) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        Doctor doctor;

        if (hospitalId == null) {

            // SUPER_ADMIN
            doctor = doctorRepository
                    .findByIdAndDeletedAtIsNull(doctorId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Doctor not found"
                            )
                    );

        } else {

            // HOSPITAL_ADMIN
            doctor = doctorRepository
                    .findByIdAndHospitalIdAndDeletedAtIsNull(
                            doctorId,
                            hospitalId
                    )
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Doctor not found"
                            )
                    );
        }

        doctor.setStatus(
                request.getStatus()
        );

        Doctor updatedDoctor =
                doctorRepository.save(doctor);

        return ApiResponse.<DoctorResponse>builder()
                .success(true)
                .message(
                        "Doctor status updated successfully"
                )
                .data(
                        doctorMapper.toResponse(updatedDoctor)
                )
                .build();
    }

     
    // SEARCH DOCTORS
  

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<DoctorResponse>> searchDoctors(
            String keyword,
            int page,
            int size) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        if (keyword == null ||
                keyword.trim().isEmpty()) {

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

        String normalizedKeyword =
                keyword.trim();

        Pageable pageable =
                PageRequest.of(page, size);

        Page<Doctor> doctorPage;

        if (hospitalId == null) {

            // SUPER_ADMIN
            doctorPage =
                    doctorRepository
                            .findBySpecializationContainingIgnoreCaseAndDeletedAtIsNull(
                                    normalizedKeyword,
                                    pageable
                            );

        } else {

            // HOSPITAL_ADMIN
            doctorPage =
                    doctorRepository
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
                        .totalElements(
                                doctorPage.getTotalElements()
                        )
                        .totalPages(
                                doctorPage.getTotalPages()
                        )
                        .first(doctorPage.isFirst())
                        .last(doctorPage.isLast())
                        .hasNext(doctorPage.hasNext())
                        .hasPrevious(
                                doctorPage.hasPrevious()
                        )
                        .build();

        return ApiResponse.<PageResponse<DoctorResponse>>builder()
                .success(true)
                .message("Doctors fetched successfully")
                .data(response)
                .build();
    }

 
    // DELETE DOCTOR
   

    @Override
    public ApiResponse<String> deleteDoctor(
            Long doctorId) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        Doctor doctor;

        if (hospitalId == null) {

            // SUPER_ADMIN
            doctor = doctorRepository
                    .findByIdAndDeletedAtIsNull(doctorId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Doctor not found"
                            )
                    );

        } else {

            // HOSPITAL_ADMIN
            doctor = doctorRepository
                    .findByIdAndHospitalIdAndDeletedAtIsNull(
                            doctorId,
                            hospitalId
                    )
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Doctor not found"
                            )
                    );
        }

        doctor.setDeletedAt(
                LocalDateTime.now()
        );

        doctorRepository.save(doctor);

        return ApiResponse.<String>builder()
                .success(true)
                .message("Doctor deleted successfully")
                .data("Deleted")
                .build();
    }

    
    // RESTORE DOCTOR
    

    @Override
    public ApiResponse<String> restoreDoctor(
            Long doctorId) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        Doctor doctor;

        if (hospitalId == null) {

            // SUPER_ADMIN
            doctor = doctorRepository
                    .findById(doctorId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Doctor not found"
                            )
                    );

        } else {

            // HOSPITAL_ADMIN
            doctor = doctorRepository
                    .findByIdAndHospitalId(
                            doctorId,
                            hospitalId
                    )
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Doctor not found"
                            )
                    );
        }

        if (doctor.getDeletedAt() == null) {

            throw new BusinessException(
                    "Doctor is already active"
            );
        }

        doctor.setDeletedAt(null);

        doctorRepository.save(doctor);

        return ApiResponse.<String>builder()
                .success(true)
                .message("Doctor restored successfully")
                .data("Restored")
                .build();
    }
}