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

import java.util.List;

@Service
@RequiredArgsConstructor
public class NurseServiceImpl implements NurseService {

    private final NurseRepository nurseRepository;
    private final UserRepository userRepository;
    private final NurseMapper nurseMapper;

     
    @Override
    public ApiResponse<NurseResponse> createNurse(
            CreateNurseRequest request) {

        User currentUser = getCurrentUser();

        // Nurse management should happen inside hospital
        if (currentUser.getHospital() == null) {
            throw new BusinessException(
                    "User is not associated with any hospital"
            );
        }

        User user =
                userRepository
                        .findById(request.getUserId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found"
                                ));

        // User must belong to current hospital
        if (user.getHospital() == null
                || !user.getHospital().getId()
                        .equals(currentUser.getHospital().getId())) {

            throw new BusinessException(
                    "User does not belong to your hospital"
            );
        }

        // Prevent duplicate nurse profile
        if (nurseRepository
                .existsByUserIdAndDeletedAtIsNull(
                        user.getId()
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

        nurse.setStatus(NurseStatus.ACTIVE);

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
    public ApiResponse<NurseResponse> getNurseById(
            Long nurseId) {

        User currentUser = getCurrentUser();

        Nurse nurse =
                nurseRepository
                        .findByIdAndDeletedAtIsNull(
                                nurseId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Nurse not found"
                                ));

        validateHospitalAccess(
                nurse,
                currentUser
        );

        return ApiResponse.<NurseResponse>builder()
                .success(true)
                .message("Nurse fetched successfully")
                .data(
                        nurseMapper.toResponse(
                                nurse
                        )
                )
                .build();
    }

    

    @Override
    public ApiResponse<List<NurseResponse>> getAllNurses() {

        User currentUser = getCurrentUser();

        if (currentUser.getHospital() == null) {
            throw new BusinessException(
                    "User is not associated with any hospital"
            );
        }

        List<NurseResponse> nurses =
                nurseRepository
                        .findAll()
                        .stream()
                        .filter(nurse ->
                                nurse.getDeletedAt() == null
                        )
                        .filter(nurse ->
                                nurse.getHospital() != null
                                        && nurse.getHospital().getId()
                                        .equals(
                                                currentUser
                                                        .getHospital()
                                                        .getId()
                                        )
                        )
                        .map(nurseMapper::toResponse)
                        .toList();

        return ApiResponse.<List<NurseResponse>>builder()
                .success(true)
                .message("Nurses fetched successfully")
                .data(nurses)
                .build();
    }

     

    @Override
    public ApiResponse<NurseResponse> updateNurse(
            Long nurseId,
            UpdateNurseRequest request) {

        User currentUser = getCurrentUser();

        Nurse nurse =
                nurseRepository
                        .findByIdAndDeletedAtIsNull(
                                nurseId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Nurse not found"
                                ));

        validateHospitalAccess(
                nurse,
                currentUser
        );

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
                        nurseMapper.toResponse(
                                updatedNurse
                        )
                )
                .build();
    }

     
    @Override
    public ApiResponse<Void> deleteNurse(
            Long nurseId) {

        User currentUser = getCurrentUser();

        Nurse nurse =
                nurseRepository
                        .findByIdAndDeletedAtIsNull(
                                nurseId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Nurse not found"
                                ));

        validateHospitalAccess(
                nurse,
                currentUser
        );

        nurse.setDeletedAt(
                java.time.LocalDateTime.now()
        );

        nurseRepository.save(nurse);

        return ApiResponse.<Void>builder()
                .success(true)
                .message("Nurse deleted successfully")
                .data(null)
                .build();
    }

    

    @Override
    public ApiResponse<NurseResponse> activateNurse(
            Long nurseId) {

        User currentUser = getCurrentUser();

        Nurse nurse =
                nurseRepository
                        .findByIdAndDeletedAtIsNull(
                                nurseId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Nurse not found"
                                ));

        validateHospitalAccess(
                nurse,
                currentUser
        );

        nurse.setStatus(
                NurseStatus.ACTIVE
        );

        Nurse savedNurse =
                nurseRepository.save(nurse);

        return ApiResponse.<NurseResponse>builder()
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
    public ApiResponse<NurseResponse> deactivateNurse(
            Long nurseId) {

        User currentUser = getCurrentUser();

        Nurse nurse =
                nurseRepository
                        .findByIdAndDeletedAtIsNull(
                                nurseId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Nurse not found"
                                ));

        validateHospitalAccess(
                nurse,
                currentUser
        );

        nurse.setStatus(
                NurseStatus.INACTIVE
        );

        Nurse savedNurse =
                nurseRepository.save(nurse);

        return ApiResponse.<NurseResponse>builder()
                .success(true)
                .message("Nurse deactivated successfully")
                .data(
                        nurseMapper.toResponse(
                                savedNurse
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
                        ));
    }

    private void validateHospitalAccess(
            Nurse nurse,
            User currentUser) {

        if (currentUser.getHospital() == null
                || nurse.getHospital() == null
                || !nurse.getHospital().getId()
                        .equals(
                                currentUser
                                        .getHospital()
                                        .getId()
                        )) {

            throw new BusinessException(
                    "You are not authorized to access this hospital data"
            );
        }
    }
}