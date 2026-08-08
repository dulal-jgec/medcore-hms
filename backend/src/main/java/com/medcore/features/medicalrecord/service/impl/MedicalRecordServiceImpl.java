package com.medcore.features.medicalrecord.service.impl;

import com.medcore.common.exception.AccessDeniedException;
import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.security.SecurityUtil;
import com.medcore.features.appointment.entity.Appointment;
import com.medcore.features.appointment.enums.AppointmentStatus;
import com.medcore.features.appointment.repository.AppointmentRepository;
import com.medcore.features.doctor.entity.Doctor;
import com.medcore.features.doctor.repository.DoctorRepository;
import com.medcore.features.medicalrecord.dto.request.CreateMedicalRecordRequest;
import com.medcore.features.medicalrecord.dto.response.MedicalRecordResponse;
import com.medcore.features.medicalrecord.entity.MedicalRecord;
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


    // =========================================================
    // CREATE MEDICAL RECORD
    // =========================================================

    @Override
    public ApiResponse<MedicalRecordResponse> createMedicalRecord(
            CreateMedicalRecordRequest request) {

        // 1. Get currently logged-in user
        User currentUser = getCurrentUser();

        // 2. Current user must be a doctor
        Doctor currentDoctor = doctorRepository
                .findByUserId(currentUser.getId())
                .orElseThrow(() ->
                        new BusinessException(
                                "Only doctors can create medical records"
                        ));

        // 3. Find appointment
        Appointment appointment = appointmentRepository
                .findByIdAndDeletedAtIsNull(
                        request.getAppointmentId()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Appointment not found"
                        ));

        // 4. Doctor must own this appointment
        if (!appointment.getDoctor().getId()
                .equals(currentDoctor.getId())) {

            throw new BusinessException(
                    "You are not authorized to create a medical record for this appointment"
            );
        }

        // 5. Hospital isolation
        if (currentUser.getHospital() == null
                || !appointment.getHospital().getId()
                .equals(currentUser.getHospital().getId())) {

            throw new BusinessException(
                    "You are not authorized to access this hospital data"
            );
        }

        // 6. Appointment must be completed
        if (appointment.getStatus() != AppointmentStatus.COMPLETED) {

            throw new BusinessException(
                    "Medical record can only be created for a completed appointment"
            );
        }

        // 7. Prevent duplicate medical record
        if (medicalRecordRepository
                .existsByAppointmentIdAndDeletedAtIsNull(
                        appointment.getId()
                )) {

            throw new BusinessException(
                    "Medical record already exists for this appointment"
            );
        }

        // 8. Convert request to entity
        MedicalRecord record =
                medicalRecordMapper.toEntity(request);

        // 9. Set trusted relationships from server-side data
        record.setAppointment(appointment);
        record.setPatient(appointment.getPatient());
        record.setDoctor(appointment.getDoctor());
        record.setHospital(appointment.getHospital());

        // 10. Save
        MedicalRecord savedRecord =
                medicalRecordRepository.save(record);

        return ApiResponse.<MedicalRecordResponse>builder()
                .success(true)
                .message("Medical record created successfully")
                .data(medicalRecordMapper.toResponse(savedRecord))
                .build();
    }


    // =========================================================
    // GET MEDICAL RECORD BY ID
    // =========================================================

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
                .data(medicalRecordMapper.toResponse(record))
                .build();
    }


    // =========================================================
    // GET MEDICAL RECORD BY APPOINTMENT
    // =========================================================

    @Override
    public ApiResponse<MedicalRecordResponse> getMedicalRecordByAppointment(
            Long appointmentId) {

        User currentUser = getCurrentUser();

        MedicalRecord record = medicalRecordRepository
                .findByAppointmentIdAndDeletedAtIsNull(appointmentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Medical record not found for this appointment"
                        ));

        validateRecordAccess(record, currentUser);

        return ApiResponse.<MedicalRecordResponse>builder()
                .success(true)
                .message("Medical record fetched successfully")
                .data(medicalRecordMapper.toResponse(record))
                .build();
    }


    // =========================================================
    // GET CURRENT USER
    // =========================================================

    private User getCurrentUser() {

        String email = SecurityUtil.getCurrentUsername();

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Current user not found"
                        ));
    }


    // =========================================================
    // FIND RECORD WITH AUTHORIZATION
    // =========================================================

    private MedicalRecord findRecordForAuthorizedUser(
            Long recordId,
            User currentUser) {

        // Doctor access
        Doctor doctor = doctorRepository
                .findByUserId(currentUser.getId())
                .orElse(null);

        if (doctor != null) {

            return medicalRecordRepository
                    .findByIdAndDoctorIdAndDeletedAtIsNull(
                            recordId,
                            doctor.getId()
                    )
                    .filter(record ->
                            isSameHospital(record, currentUser)
                    )
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Medical record not found"
                            ));
        }

        // Patient access
        Patient patient = patientRepository
                .findByUserId(currentUser.getId())
                .orElse(null);

        if (patient != null) {

            return medicalRecordRepository
                    .findByIdAndPatientIdAndDeletedAtIsNull(
                            recordId,
                            patient.getId()
                    )
                    .filter(record ->
                            isSameHospital(record, currentUser)
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


    // =========================================================
    // VALIDATE RECORD ACCESS
    // =========================================================

    private void validateRecordAccess(
            MedicalRecord record,
            User currentUser) {

        boolean authorized = false;

        Doctor doctor = doctorRepository
                .findByUserId(currentUser.getId())
                .orElse(null);

        if (doctor != null) {

            authorized = record.getDoctor().getId()
                    .equals(doctor.getId());
        }

        Patient patient = patientRepository
                .findByUserId(currentUser.getId())
                .orElse(null);

        if (patient != null) {

            authorized = record.getPatient().getId()
                    .equals(patient.getId());
        }

        if (authorized && !isSameHospital(record, currentUser)) {
            authorized = false;
        }

        if (!authorized) {
        	throw new AccessDeniedException(
        	        "You are not authorized to access this medical record"
        	);
        }
    }


    // =========================================================
    // HOSPITAL ISOLATION
    // =========================================================

    private boolean isSameHospital(
            MedicalRecord record,
            User currentUser) {

        return currentUser.getHospital() != null
                && record.getHospital() != null
                && record.getHospital().getId()
                .equals(currentUser.getHospital().getId());
    }
}