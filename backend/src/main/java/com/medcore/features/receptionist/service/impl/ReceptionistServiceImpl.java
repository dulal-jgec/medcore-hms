package com.medcore.features.receptionist.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.PageResponse;
import com.medcore.common.security.SecurityUtil;

import com.medcore.features.receptionist.dto.request.CreateReceptionistRequest;
import com.medcore.features.receptionist.dto.request.UpdateReceptionistRequest;
import com.medcore.features.receptionist.dto.response.ReceptionistResponse;

import com.medcore.features.receptionist.entity.Receptionist;
import com.medcore.features.receptionist.enums.ReceptionistStatus;
import com.medcore.features.receptionist.mapper.ReceptionistMapper;
import com.medcore.features.receptionist.repository.ReceptionistRepository;
import com.medcore.features.receptionist.service.ReceptionistService;

import com.medcore.features.user.entity.User;
import com.medcore.features.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import com.medcore.features.appointment.dto.response.AppointmentResponse;
import com.medcore.features.appointment.service.AppointmentService;
import com.medcore.features.patient.dto.request.CreatePatientRequest;
import com.medcore.features.patient.dto.response.PatientResponse;
import com.medcore.features.patient.service.PatientService;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReceptionistServiceImpl
        implements ReceptionistService {

    private final ReceptionistRepository receptionistRepository;
    private final UserRepository userRepository;
    private final ReceptionistMapper receptionistMapper;
    private final PatientService patientService;
    private final AppointmentService appointmentService;
     
    @Override
    public ApiResponse<ReceptionistResponse> createReceptionist(
            CreateReceptionistRequest request) {

        User currentUser = getCurrentUser();

        // Current user must belong to a hospital
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

        // User must belong to same hospital
        if (user.getHospital() == null
                || !user.getHospital().getId()
                        .equals(
                                currentUser
                                        .getHospital()
                                        .getId()
                        )) {

            throw new BusinessException(
                    "User does not belong to your hospital"
            );
        }

        // Prevent duplicate receptionist profile
        if (receptionistRepository
                .existsByUserIdAndDeletedAtIsNull(
                        user.getId()
                )) {

            throw new BusinessException(
                    "Receptionist profile already exists for this user"
            );
        }

        Receptionist receptionist =
                receptionistMapper.toEntity(
                        request,
                        user
                );

        receptionist.setStatus(
                ReceptionistStatus.ACTIVE
        );

        Receptionist savedReceptionist =
                receptionistRepository.save(
                        receptionist
                );

        return ApiResponse.<ReceptionistResponse>builder()
                .success(true)
                .message("Receptionist created successfully")
                .data(
                        receptionistMapper.toResponse(
                                savedReceptionist
                        )
                )
                .build();
    }


     

    @Override
    public ApiResponse<ReceptionistResponse> getReceptionistById(
            Long receptionistId) {

        User currentUser = getCurrentUser();

        Receptionist receptionist =
                getReceptionist(receptionistId);

        validateHospitalAccess(
                receptionist,
                currentUser
        );

        return ApiResponse.<ReceptionistResponse>builder()
                .success(true)
                .message("Receptionist fetched successfully")
                .data(
                        receptionistMapper.toResponse(
                                receptionist
                        )
                )
                .build();
    }


    

    @Override
    public ApiResponse<List<ReceptionistResponse>>
    getAllReceptionists() {

        User currentUser = getCurrentUser();

        if (currentUser.getHospital() == null) {

            throw new BusinessException(
                    "User is not associated with any hospital"
            );
        }

        Long hospitalId =
                currentUser
                        .getHospital()
                        .getId();

        List<ReceptionistResponse> receptionists =
                receptionistRepository
                        .findAll()
                        .stream()
                        .filter(receptionist ->
                                receptionist.getDeletedAt() == null
                        )
                        .filter(receptionist ->
                                receptionist.getHospital() != null
                                        && receptionist
                                                .getHospital()
                                                .getId()
                                                .equals(hospitalId)
                        )
                        .map(
                                receptionistMapper::toResponse
                        )
                        .toList();

        return ApiResponse
                .<List<ReceptionistResponse>>builder()
                .success(true)
                .message(
                        "Receptionists fetched successfully"
                )
                .data(receptionists)
                .build();
    }


     

    @Override
    public ApiResponse<ReceptionistResponse> updateReceptionist(
            Long receptionistId,
            UpdateReceptionistRequest request) {

        User currentUser = getCurrentUser();

        Receptionist receptionist =
                getReceptionist(receptionistId);

        validateHospitalAccess(
                receptionist,
                currentUser
        );

        receptionistMapper.updateEntity(
                receptionist,
                request
        );

        Receptionist updatedReceptionist =
                receptionistRepository.save(
                        receptionist
                );

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
    public ApiResponse<Void> deleteReceptionist(
            Long receptionistId) {

        User currentUser = getCurrentUser();

        Receptionist receptionist =
                getReceptionist(receptionistId);

        validateHospitalAccess(
                receptionist,
                currentUser
        );

        receptionist.setDeletedAt(
                LocalDateTime.now()
        );

        receptionistRepository.save(
                receptionist
        );

        return ApiResponse.<Void>builder()
                .success(true)
                .message(
                        "Receptionist deleted successfully"
                )
                .data(null)
                .build();
    }


     

    @Override
    public ApiResponse<ReceptionistResponse>
    activateReceptionist(
            Long receptionistId) {

        User currentUser = getCurrentUser();

        Receptionist receptionist =
                getReceptionist(receptionistId);

        validateHospitalAccess(
                receptionist,
                currentUser
        );

        receptionist.setStatus(
                ReceptionistStatus.ACTIVE
        );

        Receptionist savedReceptionist =
                receptionistRepository.save(
                        receptionist
                );

        return ApiResponse.<ReceptionistResponse>builder()
                .success(true)
                .message(
                        "Receptionist activated successfully"
                )
                .data(
                        receptionistMapper.toResponse(
                                savedReceptionist
                        )
                )
                .build();
    }


   
    @Override
    public ApiResponse<ReceptionistResponse>
    deactivateReceptionist(
            Long receptionistId) {

        User currentUser = getCurrentUser();

        Receptionist receptionist =
                getReceptionist(receptionistId);

        validateHospitalAccess(
                receptionist,
                currentUser
        );

        receptionist.setStatus(
                ReceptionistStatus.INACTIVE
        );

        Receptionist savedReceptionist =
                receptionistRepository.save(
                        receptionist
                );

        return ApiResponse.<ReceptionistResponse>builder()
                .success(true)
                .message(
                        "Receptionist deactivated successfully"
                )
                .data(
                        receptionistMapper.toResponse(
                                savedReceptionist
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
                        )
                );
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
            Receptionist receptionist,
            User currentUser) {

        if (currentUser.getHospital() == null
                || receptionist.getHospital() == null
                || !receptionist
                        .getHospital()
                        .getId()
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
    
@Override
public ApiResponse<PatientResponse> registerPatient(
        CreatePatientRequest request) {

    User currentUser = getCurrentUser();

    if (currentUser.getHospital() == null) {

        throw new BusinessException(
                "User is not associated with any hospital"
        );
    }

    Receptionist receptionist =
            receptionistRepository
                    .findByUserIdAndDeletedAtIsNull(
                            currentUser.getId()
                    )
                    .orElseThrow(() ->
                            new BusinessException(
                                    "Only receptionists can register patients"
                            ));

    if (receptionist.getStatus()
            != ReceptionistStatus.ACTIVE) {

        throw new BusinessException(
                "Inactive receptionists cannot register patients"
        );
    }

    return patientService.createPatient(request);
}
    
    @Override
    public ApiResponse<AppointmentResponse> checkInPatient(
            Long appointmentId) {

        User currentUser = getCurrentUser();

        Receptionist receptionist =
                receptionistRepository
                        .findByUserIdAndDeletedAtIsNull(
                                currentUser.getId()
                        )
                        .orElseThrow(() ->
                                new BusinessException(
                                        "Only receptionists can check in patients"
                                ));

        if (receptionist.getStatus()
                != ReceptionistStatus.ACTIVE) {

            throw new BusinessException(
                    "Inactive receptionists cannot check in patients"
            );
        }

        if (currentUser.getHospital() == null) {

            throw new BusinessException(
                    "User is not associated with any hospital"
            );
        }

        /*
         * Reuse existing AppointmentService.
         *
         * Use your existing check-in method here.
         */
        return appointmentService.checkInAppointment(
                appointmentId
        );
    }
    
 @Override
public ApiResponse<PageResponse<AppointmentResponse>> getTodayAppointments(
        int page,
        int size,
        String sortBy,
        String sortDir) {

    User currentUser = getCurrentUser();

    Receptionist receptionist =
            receptionistRepository
                    .findByUserIdAndDeletedAtIsNull(
                            currentUser.getId()
                    )
                    .orElseThrow(() ->
                            new BusinessException(
                                    "Only receptionists can access appointment queue"
                            ));

    if (receptionist.getStatus()
            != ReceptionistStatus.ACTIVE) {

        throw new BusinessException(
                "Inactive receptionists cannot access appointment queue"
        );
    }

    if (currentUser.getHospital() == null) {

        throw new BusinessException(
                "User is not associated with any hospital"
        );
    }

    return appointmentService.getTodayAppointments(
            page,
            size,
            sortBy,
            sortDir
    );
}
 	
 
 @Override
 public ApiResponse<PageResponse<PatientResponse>> searchPatients(
         String keyword,
         int page,
         int size) {

     User currentUser = getCurrentUser();

     Receptionist receptionist =
             receptionistRepository
                     .findByUserIdAndDeletedAtIsNull(
                             currentUser.getId()
                     )
                     .orElseThrow(() ->
                             new BusinessException(
                                     "Only receptionists can search patients"
                             ));

     if (receptionist.getStatus()
             != ReceptionistStatus.ACTIVE) {

         throw new BusinessException(
                 "Inactive receptionists cannot search patients"
         );
     }

     if (currentUser.getHospital() == null) {

         throw new BusinessException(
                 "User is not associated with any hospital"
         );
     }

     return patientService.searchPatients(
             keyword,
             page,
             size
     );
 }
}