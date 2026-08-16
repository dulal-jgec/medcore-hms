package com.medcore.features.nurse.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.security.SecurityUtil;
import com.medcore.features.nurse.dto.request.CreateNurseRequest;
import com.medcore.features.nurse.dto.request.UpdateNurseRequest;
import com.medcore.features.nurse.dto.response.NurseResponse;
import com.medcore.features.nurse.entity.Nurse;
import com.medcore.features.nurse.enums.NurseStatus;
import com.medcore.features.nurse.mapper.NurseMapper;
import com.medcore.features.nurse.repository.NurseRepository;
import com.medcore.features.nurse.service.NurseService;
import com.medcore.features.user.entity.User;
import com.medcore.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.medcore.common.security.TenantContextService;
import com.medcore.features.hospital.entity.Hospital;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import com.medcore.features.hospital.repository.HospitalRepository;
@Service
@RequiredArgsConstructor
public class NurseServiceImpl implements NurseService {

    private final NurseRepository nurseRepository;
    private final UserRepository userRepository;
    private final NurseMapper nurseMapper;
    private final HospitalRepository hospitalRepository;
    private final TenantContextService tenantContextService;
     
@Override
@Transactional
public ApiResponse<NurseResponse> createNurse(
        CreateNurseRequest request) {

    Long currentHospitalId =
            tenantContextService.getCurrentHospitalId();

    Long hospitalId;

     
    if (currentHospitalId == null) {

        hospitalId = request.getHospitalId();

    } else {

         
        if (!request.getHospitalId().equals(currentHospitalId)) {

            throw new BusinessException(
                    "You cannot create a nurse for another hospital"
            );
        }

        hospitalId = currentHospitalId;
    }

 
    Hospital hospital =
            hospitalRepository
                    .findByIdAndDeletedAtIsNull(hospitalId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Hospital not found"
                            ));

    User user =
            userRepository
                    .findById(request.getUserId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "User not found"
                            ));

    if (user.getHospital() == null
            || !user.getHospital()
                    .getId()
                    .equals(hospitalId)) {

        throw new BusinessException(
                "User does not belong to the selected hospital"
        );
    }

 
    if (nurseRepository
            .existsByUserIdAndHospitalIdAndDeletedAtIsNull(
                    user.getId(),
                    hospitalId
            )) {

        throw new BusinessException(
                "Nurse profile already exists for this user"
        );
    }

 
    Nurse nurse =
            nurseMapper.toEntity(
                    request,
                    user
            );

 
    nurse.setHospital(hospital);

    nurse.setStatus(
            NurseStatus.ACTIVE
    );


    Nurse savedNurse =
            nurseRepository.save(nurse);


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

    Nurse nurse;

    if (hospitalId == null) {

        nurse =
                nurseRepository
                        .findByIdAndDeletedAtIsNull(nurseId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Nurse not found"
                                ));

    } else {

        nurse =
                nurseRepository
                        .findByIdAndHospitalIdAndDeletedAtIsNull(
                                nurseId,
                                hospitalId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Nurse not found"
                                ));
    }

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

    List<Nurse> nurses;

    if (hospitalId == null) {

        nurses =
                nurseRepository
                        .findAll()
                        .stream()
                        .filter(nurse ->
                                nurse.getDeletedAt() == null
                        )
                        .toList();

    } else {

        nurses =
                nurseRepository
                        .findByHospitalIdAndDeletedAtIsNull(
                                hospitalId
                        );
    }

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

    Nurse nurse;

    if (hospitalId == null) {

        nurse =
                nurseRepository
                        .findByIdAndDeletedAtIsNull(nurseId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Nurse not found"
                                ));

    } else {

        nurse =
                nurseRepository
                        .findByIdAndHospitalIdAndDeletedAtIsNull(
                                nurseId,
                                hospitalId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Nurse not found"
                                ));
    }

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

    Nurse nurse;

    if (hospitalId == null) {

        nurse =
                nurseRepository
                        .findByIdAndDeletedAtIsNull(nurseId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Nurse not found"
                                ));

    } else {

        nurse =
                nurseRepository
                        .findByIdAndHospitalIdAndDeletedAtIsNull(
                                nurseId,
                                hospitalId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Nurse not found"
                                ));
    }

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

    Nurse nurse;

    if (hospitalId == null) {

        nurse =
                nurseRepository
                        .findByIdAndDeletedAtIsNull(nurseId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Nurse not found"
                                ));

    } else {

        nurse =
                nurseRepository
                        .findByIdAndHospitalIdAndDeletedAtIsNull(
                                nurseId,
                                hospitalId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Nurse not found"
                                ));
    }

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

    Nurse nurse;

    if (hospitalId == null) {

        nurse =
                nurseRepository
                        .findByIdAndDeletedAtIsNull(nurseId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Nurse not found"
                                ));

    } else {

        nurse =
                nurseRepository
                        .findByIdAndHospitalIdAndDeletedAtIsNull(
                                nurseId,
                                hospitalId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Nurse not found"
                                ));
    }

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

     
     
}