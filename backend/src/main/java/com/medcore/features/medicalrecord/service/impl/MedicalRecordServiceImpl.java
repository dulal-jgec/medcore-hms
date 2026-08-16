package com.medcore.features.medicalrecord.service.impl;

import com.medcore.common.exception.AccessDeniedException;
import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.security.SecurityUtil;
import com.medcore.common.security.TenantContextService;
import com.medcore.features.appointment.entity.Appointment;
import com.medcore.features.appointment.enums.AppointmentStatus;
import com.medcore.features.appointment.repository.AppointmentRepository;
import com.medcore.features.doctor.entity.Doctor;
import com.medcore.features.doctor.repository.DoctorRepository;
import com.medcore.features.medicalrecord.dto.request.CreateMedicalRecordRequest;
import com.medcore.features.medicalrecord.dto.response.MedicalRecordResponse;
import com.medcore.features.medicalrecord.entity.MedicalRecord;
import com.medcore.features.medicalrecord.enums.MedicalRecordStatus;
import com.medcore.features.medicalrecord.mapper.MedicalRecordMapper;
import com.medcore.features.medicalrecord.repository.MedicalRecordRepository;
import com.medcore.features.medicalrecord.service.MedicalRecordService;
import com.medcore.features.patient.entity.Patient;
import com.medcore.features.patient.repository.PatientRepository;
import com.medcore.features.user.entity.User;
import com.medcore.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MedicalRecordServiceImpl
        implements MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordMapper medicalRecordMapper;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final TenantContextService tenantContextService;

    @Override
    public ApiResponse<MedicalRecordResponse> createMedicalRecord(
            CreateMedicalRecordRequest request) {

        User currentUser = getCurrentUser();

        Doctor currentDoctor =
                doctorRepository
                        .findByUserIdAndDeletedAtIsNull(
                                currentUser.getId()
                        )
                        .orElseThrow(() ->
                                new BusinessException(
                                        "Only doctors can create medical records"
                                ));

        Appointment appointment =
                appointmentRepository
                        .findByIdAndDeletedAtIsNull(
                                request.getAppointmentId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Appointment not found"
                                ));

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        if (hospitalId != null
                && (appointment.getHospital() == null
                || !appointment.getHospital()
                        .getId()
                        .equals(hospitalId))) {

            throw new BusinessException(
                    "You are not authorized to access this hospital data"
            );
        }

        if (appointment.getDoctor() == null
                || !appointment.getDoctor()
                        .getId()
                        .equals(currentDoctor.getId())) {

            throw new BusinessException(
                    "You are not authorized to create a medical record for this appointment"
            );
        }

        if (appointment.getStatus()
                != AppointmentStatus.COMPLETED) {

            throw new BusinessException(
                    "Medical record can only be created for a completed appointment"
            );
        }

        if (medicalRecordRepository
                .existsByAppointmentIdAndDeletedAtIsNull(
                        appointment.getId()
                )) {

            throw new BusinessException(
                    "Medical record already exists for this appointment"
            );
        }

        MedicalRecord record =
                medicalRecordMapper.toEntity(request);

        record.setAppointment(appointment);
        record.setPatient(appointment.getPatient());
        record.setDoctor(appointment.getDoctor());
        record.setHospital(appointment.getHospital());
        record.setStatus(MedicalRecordStatus.OPEN);

        MedicalRecord savedRecord =
                medicalRecordRepository.save(record);

        return ApiResponse.<MedicalRecordResponse>builder()
                .success(true)
                .message("Medical record created successfully")
                .data(
                        medicalRecordMapper.toResponse(
                                savedRecord
                        )
                )
                .build();
    }

    @Override
    public ApiResponse<MedicalRecordResponse> getMedicalRecordById(
            Long recordId) {

        User currentUser = getCurrentUser();

        MedicalRecord record =
                findRecordForAuthorizedUser(
                        recordId,
                        currentUser
                );

        return ApiResponse.<MedicalRecordResponse>builder()
                .success(true)
                .message("Medical record fetched successfully")
                .data(
                        medicalRecordMapper.toResponse(
                                record
                        )
                )
                .build();
    }

    @Override
    public ApiResponse<MedicalRecordResponse> getMedicalRecordByAppointment(
            Long appointmentId) {

        User currentUser = getCurrentUser();

        MedicalRecord record =
                medicalRecordRepository
                        .findByAppointmentIdAndDeletedAtIsNull(
                                appointmentId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Medical record not found for this appointment"
                                ));

        validateRecordAccess(
                record,
                currentUser
        );

        return ApiResponse.<MedicalRecordResponse>builder()
                .success(true)
                .message("Medical record fetched successfully")
                .data(
                        medicalRecordMapper.toResponse(
                                record
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

    private MedicalRecord findRecordForAuthorizedUser(
            Long recordId,
            User currentUser) {

        Doctor doctor =
                doctorRepository
                        .findByUserIdAndDeletedAtIsNull(
                                currentUser.getId()
                        )
                        .orElse(null);

        if (doctor != null) {

            return medicalRecordRepository
                    .findByIdAndDoctorIdAndDeletedAtIsNull(
                            recordId,
                            doctor.getId()
                    )
                    .filter(record ->
                            isSameHospital(
                                    record,
                                    currentUser
                            )
                    )
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Medical record not found"
                            ));
        }

        Patient patient =
                patientRepository
                        .findByUserId(
                                currentUser.getId()
                        )
                        .orElse(null);

        if (patient != null) {

            return medicalRecordRepository
                    .findByIdAndPatientIdAndDeletedAtIsNull(
                            recordId,
                            patient.getId()
                    )
                    .filter(record ->
                            isSameHospital(
                                    record,
                                    currentUser
                            )
                    )
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Medical record not found"
                            ));
        }

        throw new BusinessException(
                "You are not authorized to access medical records"
        );
    }

    private void validateRecordAccess(
            MedicalRecord record,
            User currentUser) {

        boolean authorized = false;

        Doctor doctor =
                doctorRepository
                        .findByUserIdAndDeletedAtIsNull(
                                currentUser.getId()
                        )
                        .orElse(null);

        if (doctor != null) {

            authorized =
                    record.getDoctor() != null
                            && record.getDoctor()
                                    .getId()
                                    .equals(doctor.getId());
        }

        Patient patient =
                patientRepository
                        .findByUserId(
                                currentUser.getId()
                        )
                        .orElse(null);

        if (patient != null) {

            authorized =
                    authorized
                            || (
                            record.getPatient() != null
                                    && record.getPatient()
                                    .getId()
                                    .equals(patient.getId())
                    );
        }

        if (authorized
                && !isSameHospital(
                        record,
                        currentUser
                )) {

            authorized = false;
        }

        if (!authorized) {

            throw new AccessDeniedException(
                    "You are not authorized to access this medical record"
            );
        }
    }

    private boolean isSameHospital(
            MedicalRecord record,
            User currentUser) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        if (hospitalId != null) {

            return record.getHospital() != null
                    && record.getHospital()
                            .getId()
                            .equals(hospitalId);
        }

        return currentUser.getHospital() != null
                && record.getHospital() != null
                && record.getHospital()
                        .getId()
                        .equals(
                                currentUser
                                        .getHospital()
                                        .getId()
                        );
    }
}