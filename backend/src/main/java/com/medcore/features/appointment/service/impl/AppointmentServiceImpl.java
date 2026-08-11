package com.medcore.features.appointment.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.PageResponse;
import com.medcore.common.security.SecurityUtil;

import com.medcore.features.appointment.dto.request.CreateAppointmentRequest;
import com.medcore.features.appointment.dto.request.UpdateAppointmentStatusRequest;
import com.medcore.features.appointment.dto.response.AppointmentResponse;
import com.medcore.features.appointment.entity.Appointment;
import com.medcore.features.appointment.enums.AppointmentStatus;
import com.medcore.features.appointment.mapper.AppointmentMapper;
import com.medcore.features.appointment.repository.AppointmentRepository;
import com.medcore.features.appointment.service.AppointmentService;

import com.medcore.features.doctor.entity.Doctor;
import com.medcore.features.doctor.entity.DoctorSchedule;
import com.medcore.features.doctor.enums.DayOfWeek;
import com.medcore.features.doctor.enums.DoctorStatus;
import com.medcore.features.doctor.repository.DoctorRepository;
import com.medcore.features.doctor.repository.DoctorScheduleRepository;

import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.repository.HospitalRepository;

import com.medcore.features.patient.entity.Patient;
import com.medcore.features.patient.enums.PatientStatus;
import com.medcore.features.patient.repository.PatientRepository;

import com.medcore.features.user.entity.User;
import com.medcore.features.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
 
import java.time.LocalDate;
import java.util.List;
import java.time.LocalDateTime;
 
@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl
        implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final HospitalRepository hospitalRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final DoctorScheduleRepository doctorScheduleRepository;
    private final AppointmentMapper appointmentMapper;
    private final UserRepository userRepository;


    

    @Override
    public ApiResponse<AppointmentResponse> createAppointment(
            CreateAppointmentRequest request) {

        if (!request.getStartTime()
                .isBefore(request.getEndTime())) {

            throw new BusinessException(
                    "Start time must be before end time"
            );
        }

        Hospital hospital =
                hospitalRepository
                        .findByIdAndDeletedAtIsNull(
                                request.getHospitalId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Hospital not found"
                                ));

        Doctor doctor =
                doctorRepository
                        .findByIdAndDeletedAtIsNull(
                                request.getDoctorId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Doctor not found"
                                ));

        Patient patient =
                patientRepository
                        .findByIdAndDeletedAtIsNull(
                                request.getPatientId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Patient not found"
                                ));

        if (doctor.getStatus()
                != DoctorStatus.ACTIVE) {

            throw new BusinessException(
                    "Appointment cannot be created for inactive doctor"
            );
        }

        if (patient.getStatus()
                != PatientStatus.ACTIVE) {

            throw new BusinessException(
                    "Appointment cannot be created for inactive patient"
            );
        }

        if (!doctor.getHospital().getId()
                .equals(hospital.getId())) {

            throw new BusinessException(
                    "Doctor does not belong to the selected hospital"
            );
        }

        if (!patient.getHospital().getId()
                .equals(hospital.getId())) {

            throw new BusinessException(
                    "Patient does not belong to the selected hospital"
            );
        }

        DayOfWeek dayOfWeek =
                DayOfWeek.valueOf(
                        request.getAppointmentDate()
                                .getDayOfWeek()
                                .name()
                );

        List<DoctorSchedule> schedules =
                doctorScheduleRepository
                        .findByDoctorIdAndDayOfWeekAndDeletedAtIsNull(
                                doctor.getId(),
                                dayOfWeek
                        );

        boolean withinSchedule =
                schedules.stream()
                        .anyMatch(schedule ->
                                !request.getStartTime()
                                        .isBefore(
                                                schedule.getStartTime()
                                        )
                                        &&
                                !request.getEndTime()
                                        .isAfter(
                                                schedule.getEndTime()
                                        )
                        );

        if (!withinSchedule) {

            throw new BusinessException(
                    "Doctor is not available during the requested time"
            );
        }

        boolean alreadyBooked =
                appointmentRepository
                        .existsByDoctorIdAndAppointmentDateAndStartTimeLessThanAndEndTimeGreaterThanAndDeletedAtIsNull(
                                doctor.getId(),
                                request.getAppointmentDate(),
                                request.getEndTime(),
                                request.getStartTime()
                        );

        if (alreadyBooked) {

            throw new BusinessException(
                    "Doctor already has an appointment during this time"
            );
        }

        Appointment appointment =
                appointmentMapper.toEntity(
                        request,
                        hospital,
                        doctor,
                        patient
                );

        Appointment savedAppointment =
                appointmentRepository.save(
                        appointment
                );

        return ApiResponse.<AppointmentResponse>builder()
                .success(true)
                .message("Appointment created successfully")
                .data(
                        appointmentMapper.toResponse(
                                savedAppointment
                        )
                )
                .build();
    }


    

    @Override
    public ApiResponse<PageResponse<AppointmentResponse>>
    getAllAppointments(
            int page,
            int size,
            String sortBy,
            String sortDir) {

        Sort sort =
                sortDir.equalsIgnoreCase("desc")
                        ? Sort.by(sortBy).descending()
                        : Sort.by(sortBy).ascending();

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        sort
                );

        Page<Appointment> appointmentPage =
                appointmentRepository
                        .findByDeletedAtIsNull(
                                pageable
                        );

        List<AppointmentResponse> items =
                appointmentPage
                        .getContent()
                        .stream()
                        .map(appointmentMapper::toResponse)
                        .toList();

        PageResponse<AppointmentResponse> response =
                PageResponse.<AppointmentResponse>builder()
                        .items(items)
                        .page(appointmentPage.getNumber())
                        .size(appointmentPage.getSize())
                        .totalElements(
                                appointmentPage.getTotalElements()
                        )
                        .totalPages(
                                appointmentPage.getTotalPages()
                        )
                        .first(
                                appointmentPage.isFirst()
                        )
                        .last(
                                appointmentPage.isLast()
                        )
                        .hasNext(
                                appointmentPage.hasNext()
                        )
                        .hasPrevious(
                                appointmentPage.hasPrevious()
                        )
                        .build();

        return ApiResponse
                .<PageResponse<AppointmentResponse>>builder()
                .success(true)
                .message("Appointments fetched successfully")
                .data(response)
                .build();
    }


    
    @Override
    public ApiResponse<AppointmentResponse> getAppointmentById(
            Long appointmentId) {

        Appointment appointment =
                appointmentRepository
                        .findByIdAndDeletedAtIsNull(
                                appointmentId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Appointment not found"
                                ));

        return ApiResponse.<AppointmentResponse>builder()
                .success(true)
                .message("Appointment fetched successfully")
                .data(
                        appointmentMapper.toResponse(
                                appointment
                        )
                )
                .build();
    }


    
    @Override
    public ApiResponse<PageResponse<AppointmentResponse>>
    getDoctorAppointments(
            Long doctorId,
            int page,
            int size) {

        doctorRepository
                .findByIdAndDeletedAtIsNull(doctorId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Doctor not found"
                        ));

        Pageable pageable =
                PageRequest.of(
                        page,
                        size
                );

        Page<Appointment> appointmentPage =
                appointmentRepository
                        .findByDoctorIdAndDeletedAtIsNull(
                                doctorId,
                                pageable
                        );

        List<AppointmentResponse> items =
                appointmentPage
                        .getContent()
                        .stream()
                        .map(appointmentMapper::toResponse)
                        .toList();

        PageResponse<AppointmentResponse> response =
                PageResponse.<AppointmentResponse>builder()
                        .items(items)
                        .page(appointmentPage.getNumber())
                        .size(appointmentPage.getSize())
                        .totalElements(
                                appointmentPage.getTotalElements()
                        )
                        .totalPages(
                                appointmentPage.getTotalPages()
                        )
                        .first(
                                appointmentPage.isFirst()
                        )
                        .last(
                                appointmentPage.isLast()
                        )
                        .hasNext(
                                appointmentPage.hasNext()
                        )
                        .hasPrevious(
                                appointmentPage.hasPrevious()
                        )
                        .build();

        return ApiResponse
                .<PageResponse<AppointmentResponse>>builder()
                .success(true)
                .message(
                        "Doctor appointments fetched successfully"
                )
                .data(response)
                .build();
    }


    
    @Override
    public ApiResponse<PageResponse<AppointmentResponse>>
    getPatientAppointments(
            Long patientId,
            int page,
            int size) {

        patientRepository
                .findByIdAndDeletedAtIsNull(patientId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Patient not found"
                        ));

        Pageable pageable =
                PageRequest.of(
                        page,
                        size
                );

        Page<Appointment> appointmentPage =
                appointmentRepository
                        .findByPatientIdAndDeletedAtIsNull(
                                patientId,
                                pageable
                        );

        List<AppointmentResponse> items =
                appointmentPage
                        .getContent()
                        .stream()
                        .map(appointmentMapper::toResponse)
                        .toList();

        PageResponse<AppointmentResponse> response =
                PageResponse.<AppointmentResponse>builder()
                        .items(items)
                        .page(appointmentPage.getNumber())
                        .size(appointmentPage.getSize())
                        .totalElements(
                                appointmentPage.getTotalElements()
                        )
                        .totalPages(
                                appointmentPage.getTotalPages()
                        )
                        .first(
                                appointmentPage.isFirst()
                        )
                        .last(
                                appointmentPage.isLast()
                        )
                        .hasNext(
                                appointmentPage.hasNext()
                        )
                        .hasPrevious(
                                appointmentPage.hasPrevious()
                        )
                        .build();

        return ApiResponse
                .<PageResponse<AppointmentResponse>>builder()
                .success(true)
                .message(
                        "Patient appointments fetched successfully"
                )
                .data(response)
                .build();
    }


    
    @Override
    public ApiResponse<AppointmentResponse>
    updateAppointmentStatus(
            Long appointmentId,
            UpdateAppointmentStatusRequest request) {

        Appointment appointment =
                appointmentRepository
                        .findByIdAndDeletedAtIsNull(
                                appointmentId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Appointment not found"
                                ));

        AppointmentStatus currentStatus =
                appointment.getStatus();

        AppointmentStatus newStatus =
                request.getStatus();

        if (currentStatus
                == AppointmentStatus.COMPLETED) {

            throw new BusinessException(
                    "Completed appointment cannot be updated"
            );
        }

        if (currentStatus
                == AppointmentStatus.CANCELLED) {

            throw new BusinessException(
                    "Cancelled appointment cannot be updated"
            );
        }

        if (currentStatus
                == AppointmentStatus.NO_SHOW) {

            throw new BusinessException(
                    "No-show appointment cannot be updated"
            );
        }

        appointment.setStatus(newStatus);

        Appointment savedAppointment =
                appointmentRepository.save(
                        appointment
                );

        return ApiResponse.<AppointmentResponse>builder()
                .success(true)
                .message(
                        "Appointment status updated successfully"
                )
                .data(
                        appointmentMapper.toResponse(
                                savedAppointment
                        )
                )
                .build();
    }


     

    @Override
    public ApiResponse<String> cancelAppointment(
            Long appointmentId) {

        Appointment appointment =
                appointmentRepository
                        .findByIdAndDeletedAtIsNull(
                                appointmentId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Appointment not found"
                                ));

        if (appointment.getStatus()
                == AppointmentStatus.COMPLETED) {

            throw new BusinessException(
                    "Completed appointment cannot be cancelled"
            );
        }

        if (appointment.getStatus()
                == AppointmentStatus.CANCELLED) {

            throw new BusinessException(
                    "Appointment is already cancelled"
            );
        }

        appointment.setStatus(
                AppointmentStatus.CANCELLED
        );

        appointmentRepository.save(
                appointment
        );

        return ApiResponse.<String>builder()
                .success(true)
                .message(
                        "Appointment cancelled successfully"
                )
                .data("Cancelled")
                .build();
    }


    
    @Override
    public ApiResponse<String> deleteAppointment(
            Long appointmentId) {

        Appointment appointment =
                appointmentRepository
                        .findByIdAndDeletedAtIsNull(
                                appointmentId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Appointment not found"
                                ));

        appointment.setDeletedAt(
                LocalDateTime.now()
        );

        appointmentRepository.save(
                appointment
        );

        return ApiResponse.<String>builder()
                .success(true)
                .message(
                        "Appointment deleted successfully"
                )
                .data("Deleted")
                .build();
    }


     
    @Override
    public ApiResponse<String> restoreAppointment(
            Long appointmentId) {

        Appointment appointment =
                appointmentRepository
                        .findById(appointmentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Appointment not found"
                                ));

        if (appointment.getDeletedAt() == null) {

            throw new BusinessException(
                    "Appointment is already active"
            );
        }

        appointment.setDeletedAt(null);

        appointmentRepository.save(
                appointment
        );

        return ApiResponse.<String>builder()
                .success(true)
                .message(
                        "Appointment restored successfully"
                )
                .data("Restored")
                .build();
    }


    
    @Override
    public ApiResponse<AppointmentResponse>
    checkInAppointment(
            Long appointmentId) {

        User currentUser =
                getCurrentUser();

        Appointment appointment =
                appointmentRepository
                        .findByIdAndDeletedAtIsNull(
                                appointmentId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Appointment not found"
                                ));

        // -----------------------------------------------------
        // Hospital isolation
        // -----------------------------------------------------

        if (currentUser.getHospital() == null
                || appointment.getHospital() == null
                || !appointment
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

         // Appointment must be scheduled or confirmed
 
        if (appointment.getStatus()
                != AppointmentStatus.SCHEDULED
                && appointment.getStatus()
                != AppointmentStatus.CONFIRMED) {

            throw new BusinessException(
                    "Only scheduled or confirmed appointments can be checked in"
            );
        }

         // Check-in
 
        appointment.setStatus(
                AppointmentStatus.CHECKED_IN
        );

        Appointment savedAppointment =
                appointmentRepository.save(
                        appointment
                );

        return ApiResponse.<AppointmentResponse>builder()
                .success(true)
                .message(
                        "Patient checked in successfully"
                )
                .data(
                        appointmentMapper.toResponse(
                                savedAppointment
                        )
                )
                .build();
    }


     // CURRENT USER
 
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
    
    @Override
    public ApiResponse<PageResponse<AppointmentResponse>>
    getTodayAppointments(
            int page,
            int size,
            String sortBy,
            String sortDir) {

        User currentUser = getCurrentUser();

        if (currentUser.getHospital() == null) {

            throw new BusinessException(
                    "User is not associated with any hospital"
            );
        }

        Long hospitalId =
                currentUser.getHospital().getId();

        Sort.Direction direction =
                sortDir.equalsIgnoreCase("desc")
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC;

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by(direction, sortBy)
                );

        Page<Appointment> appointments =
                appointmentRepository
                        .findByHospitalIdAndAppointmentDateAndDeletedAtIsNull(
                                hospitalId,
                                LocalDate.now(),
                                pageable
                        );

        List<AppointmentResponse> content =
                appointments.getContent()
                        .stream()
                        .map(appointmentMapper::toResponse)
                        .toList();

        PageResponse<AppointmentResponse> response =
                PageResponse.<AppointmentResponse>builder()
                		.items(content)
                        .page(appointments.getNumber())
                        .size(appointments.getSize())
                        .totalElements(
                                appointments.getTotalElements()
                        )
                        .totalPages(
                                appointments.getTotalPages()
                        )
                        .last(
                                appointments.isLast()
                        )
                        .build();

        return ApiResponse
                .<PageResponse<AppointmentResponse>>builder()
                .success(true)
                .message(
                        "Today's appointments fetched successfully"
                )
                .data(response)
                .build();
    }
}