package com.medcore.features.appointment.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.PageResponse;

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
import com.medcore.features.doctor.repository.DoctorRepository;
import com.medcore.features.doctor.repository.DoctorScheduleRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.Set;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.repository.HospitalRepository;
import com.medcore.features.doctor.enums.DoctorStatus;
import com.medcore.features.patient.enums.PatientStatus;
import com.medcore.features.patient.entity.Patient;
import com.medcore.features.patient.repository.PatientRepository;


import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
 
import java.time.LocalDate;
import java.util.List;
import java.time.LocalDateTime;
import com.medcore.common.security.TenantContextService;

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
    private final TenantContextService tenantContextService;

    

    @Override
    @Transactional
    public ApiResponse<AppointmentResponse> createAppointment(
            CreateAppointmentRequest request) {
    		
    	
    	
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new BusinessException(
                    "Start time must be before end time"
            );
        }

        Long currentHospitalId =
                tenantContextService.getCurrentHospitalId();

        Long hospitalId;
        
        

        if (currentHospitalId == null) {
            // SUPER_ADMIN
            hospitalId = request.getHospitalId();
        } else {
            // HOSPITAL_ADMIN
            if (!request.getHospitalId().equals(currentHospitalId)) {
                throw new BusinessException(
                        "You cannot create an appointment for another hospital"
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

        if (!doctor.getHospital().getId().equals(hospitalId)) {
            throw new BusinessException(
                    "Doctor does not belong to the selected hospital"
            );
        }

        if (!patient.getHospital().getId().equals(hospitalId)) {
            throw new BusinessException(
                    "Patient does not belong to the selected hospital"
            );
        }
        
        if (doctor.getStatus() != DoctorStatus.ACTIVE) {
            throw new BusinessException(
                    "Appointment cannot be created for inactive doctor"
            );
        }

        if (patient.getStatus() != PatientStatus.ACTIVE) {
            throw new BusinessException(
                    "Appointment cannot be created for inactive patient"
            );
        }
        
        if (request.getAppointmentDate().isBefore(LocalDate.now())) {
            throw new BusinessException(
                    "Appointment date cannot be in the past"
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
                appointmentRepository.existsOverlappingAppointment(
                        doctor.getId(),
                        request.getAppointmentDate(),
                        request.getStartTime(),
                        request.getEndTime()
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
@Transactional(readOnly = true)
public ApiResponse<PageResponse<AppointmentResponse>> getAllAppointments(
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

    Set<String> allowedSortFields = Set.of(
            "id",
            "appointmentDate",
            "startTime",
            "endTime",
            "createdAt",
            "updatedAt"
    );

    if (!allowedSortFields.contains(sortBy)) {
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

    Pageable pageable =
            PageRequest.of(page, size, sort);

    Page<Appointment> appointmentPage;

    if (hospitalId == null) {

        // SUPER_ADMIN → all hospitals
        appointmentPage =
                appointmentRepository
                        .findByDeletedAtIsNull(pageable);

    } else {

        // HOSPITAL_ADMIN → only own hospital
        appointmentPage =
                appointmentRepository
                        .findByHospitalIdAndDeletedAtIsNull(
                                hospitalId,
                                pageable
                        );
    }

    List<AppointmentResponse> items =
            appointmentPage.getContent()
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
                    .first(appointmentPage.isFirst())
                    .last(appointmentPage.isLast())
                    .hasNext(appointmentPage.hasNext())
                    .hasPrevious(appointmentPage.hasPrevious())
                    .build();

    return ApiResponse.<PageResponse<AppointmentResponse>>builder()
            .success(true)
            .message("Appointments fetched successfully")
            .data(response)
            .build();
}


    
@Override
@Transactional(readOnly = true)
public ApiResponse<AppointmentResponse> getAppointmentById(
        Long appointmentId) {

    Long hospitalId =
            tenantContextService.getCurrentHospitalId();

    Appointment appointment;

    if (hospitalId == null) {

        // SUPER_ADMIN → can access any hospital
        appointment =
                appointmentRepository
                        .findByIdAndDeletedAtIsNull(appointmentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Appointment not found"
                                ));

    } else {

        // HOSPITAL_ADMIN → only own hospital
        appointment =
                appointmentRepository
                        .findByIdAndHospitalIdAndDeletedAtIsNull(
                                appointmentId,
                                hospitalId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Appointment not found"
                                ));
    }

    return ApiResponse.<AppointmentResponse>builder()
            .success(true)
            .message("Appointment fetched successfully")
            .data(
                    appointmentMapper.toResponse(appointment)
            )
            .build();
}


    
 @Override
@Transactional(readOnly = true)
public ApiResponse<PageResponse<AppointmentResponse>> getDoctorAppointments(
        Long doctorId,
        int page,
        int size) {

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

    Doctor doctor;

    if (hospitalId == null) {

        // SUPER_ADMIN
        doctor = doctorRepository
                .findByIdAndDeletedAtIsNull(doctorId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Doctor not found"
                        ));

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
                        ));
    }

    Pageable pageable =
            PageRequest.of(page, size);

    Page<Appointment> appointmentPage;

    if (hospitalId == null) {

        appointmentPage =
                appointmentRepository
                        .findByDoctorIdAndDeletedAtIsNull(
                                doctor.getId(),
                                pageable
                        );

    } else {

        appointmentPage =
                appointmentRepository
                        .findByDoctorIdAndHospitalIdAndDeletedAtIsNull(
                                doctor.getId(),
                                hospitalId,
                                pageable
                        );
    }

    List<AppointmentResponse> items =
            appointmentPage.getContent()
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
                    .first(appointmentPage.isFirst())
                    .last(appointmentPage.isLast())
                    .hasNext(appointmentPage.hasNext())
                    .hasPrevious(appointmentPage.hasPrevious())
                    .build();

    return ApiResponse.<PageResponse<AppointmentResponse>>builder()
            .success(true)
            .message("Doctor appointments fetched successfully")
            .data(response)
            .build();
}

    
@Override
@Transactional(readOnly = true)
public ApiResponse<PageResponse<AppointmentResponse>> getPatientAppointments(
        Long patientId,
        int page,
        int size) {

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

    Patient patient;

    if (hospitalId == null) {

        // SUPER_ADMIN
        patient = patientRepository
                .findByIdAndDeletedAtIsNull(patientId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Patient not found"
                        ));

    } else {

        // HOSPITAL_ADMIN
        patient = patientRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(
                        patientId,
                        hospitalId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Patient not found"
                        ));
    }

    Pageable pageable =
            PageRequest.of(page, size);

    Page<Appointment> appointmentPage;

    if (hospitalId == null) {

        appointmentPage =
                appointmentRepository
                        .findByPatientIdAndDeletedAtIsNull(
                                patient.getId(),
                                pageable
                        );

    } else {

        appointmentPage =
                appointmentRepository
                        .findByPatientIdAndHospitalIdAndDeletedAtIsNull(
                                patient.getId(),
                                hospitalId,
                                pageable
                        );
    }

    List<AppointmentResponse> items =
            appointmentPage.getContent()
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
                    .first(appointmentPage.isFirst())
                    .last(appointmentPage.isLast())
                    .hasNext(appointmentPage.hasNext())
                    .hasPrevious(appointmentPage.hasPrevious())
                    .build();

    return ApiResponse.<PageResponse<AppointmentResponse>>builder()
            .success(true)
            .message("Patient appointments fetched successfully")
            .data(response)
            .build();
}



@Override
@Transactional
public ApiResponse<AppointmentResponse> updateAppointmentStatus(
        Long appointmentId,
        UpdateAppointmentStatusRequest request) {

    Long hospitalId =
            tenantContextService.getCurrentHospitalId();

    Appointment appointment;

    if (hospitalId == null) {

        // SUPER_ADMIN
        appointment =
                appointmentRepository
                        .findByIdAndDeletedAtIsNull(appointmentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Appointment not found"
                                ));

    } else {

        // HOSPITAL_ADMIN / hospital user
        appointment =
                appointmentRepository
                        .findByIdAndHospitalIdAndDeletedAtIsNull(
                                appointmentId,
                                hospitalId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Appointment not found"
                                ));
    }

    AppointmentStatus currentStatus =
            appointment.getStatus();

    AppointmentStatus newStatus =
            request.getStatus();

    // Validate status transition
    validateStatusTransition(
            currentStatus,
            newStatus
    );

    appointment.setStatus(newStatus);

    Appointment savedAppointment =
            appointmentRepository.save(appointment);

    return ApiResponse.<AppointmentResponse>builder()
            .success(true)
            .message("Appointment status updated successfully")
            .data(
                    appointmentMapper.toResponse(
                            savedAppointment
                    )
            )
            .build();
}


     

@Override
@Transactional
public ApiResponse<String> cancelAppointment(
        Long appointmentId) {

    Long hospitalId =
            tenantContextService.getCurrentHospitalId();

    Appointment appointment;

    if (hospitalId == null) {

        // SUPER_ADMIN
        appointment =
                appointmentRepository
                        .findByIdAndDeletedAtIsNull(appointmentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Appointment not found"
                                ));

    } else {

        // HOSPITAL_ADMIN
        appointment =
                appointmentRepository
                        .findByIdAndHospitalIdAndDeletedAtIsNull(
                                appointmentId,
                                hospitalId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Appointment not found"
                                ));
    }

    if (appointment.getStatus() == AppointmentStatus.CHECKED_IN) {
        throw new BusinessException(
                "Checked-in appointment cannot be cancelled"
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

    appointmentRepository.save(appointment);

    return ApiResponse.<String>builder()
            .success(true)
            .message("Appointment cancelled successfully")
            .data("Cancelled")
            .build();
}


    
@Override
@Transactional
public ApiResponse<String> deleteAppointment(Long appointmentId) {

    Long hospitalId =
            tenantContextService.getCurrentHospitalId();

    Appointment appointment;

    if (hospitalId == null) {

        // SUPER_ADMIN
        appointment =
                appointmentRepository
                        .findByIdAndDeletedAtIsNull(appointmentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Appointment not found"
                                ));

    } else {

        // HOSPITAL_ADMIN
        appointment =
                appointmentRepository
                        .findByIdAndHospitalIdAndDeletedAtIsNull(
                                appointmentId,
                                hospitalId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Appointment not found"
                                ));
    }

    appointment.setDeletedAt(LocalDateTime.now());

    appointmentRepository.save(appointment);

    return ApiResponse.<String>builder()
            .success(true)
            .message("Appointment deleted successfully")
            .data("Deleted")
            .build();
}


     
@Override
@Transactional
public ApiResponse<String> restoreAppointment(
        Long appointmentId) {

    Long hospitalId =
            tenantContextService.getCurrentHospitalId();

    Appointment appointment;

    if (hospitalId == null) {

        // SUPER_ADMIN
        appointment =
                appointmentRepository
                        .findById(appointmentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Appointment not found"
                                ));

    } else {

        // HOSPITAL_ADMIN
        appointment =
                appointmentRepository
                        .findByIdAndHospitalId(
                                appointmentId,
                                hospitalId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Appointment not found"
                                ));
    }

    if (appointment.getDeletedAt() == null) {

        throw new BusinessException(
                "Appointment is already active"
        );
    }

    appointment.setDeletedAt(null);

    appointmentRepository.save(appointment);

    return ApiResponse.<String>builder()
            .success(true)
            .message("Appointment restored successfully")
            .data("Restored")
            .build();
}


    
@Override
@Transactional
public ApiResponse<AppointmentResponse> checkInAppointment(
        Long appointmentId) {

    Long hospitalId =
            tenantContextService.getCurrentHospitalId();

    if (hospitalId == null) {
        throw new BusinessException(
                "Super Admin cannot perform patient check-in"
        );
    }

    Appointment appointment =
            appointmentRepository
                    .findByIdAndHospitalIdAndDeletedAtIsNull(
                            appointmentId,
                            hospitalId
                    )
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Appointment not found"
                            ));

    if (appointment.getStatus() != AppointmentStatus.SCHEDULED
            && appointment.getStatus() != AppointmentStatus.CONFIRMED) {

        throw new BusinessException(
                "Only scheduled or confirmed appointments can be checked in"
        );
    }

    appointment.setStatus(
            AppointmentStatus.CHECKED_IN
    );

    Appointment savedAppointment =
            appointmentRepository.save(appointment);

    return ApiResponse.<AppointmentResponse>builder()
            .success(true)
            .message("Patient checked in successfully")
            .data(
                    appointmentMapper.toResponse(
                            savedAppointment
                    )
            )
            .build();
}


     
 
    
    
  @Override
@Transactional(readOnly = true)
public ApiResponse<PageResponse<AppointmentResponse>> getTodayAppointments(
        int page,
        int size,
        String sortBy,
        String sortDir) {

    Long hospitalId =
            tenantContextService.getCurrentHospitalId();

    if (hospitalId == null) {
        throw new BusinessException(
                "Super Admin cannot access hospital-specific appointments"
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

    Set<String> allowedSortFields = Set.of(
            "startTime",
            "endTime",
            "appointmentDate",
            "createdAt"
    );

    if (!allowedSortFields.contains(sortBy)) {
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

    Pageable pageable =
            PageRequest.of(page, size, sort);

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
                    .totalElements(appointments.getTotalElements())
                    .totalPages(appointments.getTotalPages())
                    .first(appointments.isFirst())
                    .last(appointments.isLast())
                    .hasNext(appointments.hasNext())
                    .hasPrevious(appointments.hasPrevious())
                    .build();

    return ApiResponse.<PageResponse<AppointmentResponse>>builder()
            .success(true)
            .message("Today's appointments fetched successfully")
            .data(response)
            .build();
}
  private void validateStatusTransition(
	        AppointmentStatus currentStatus,
	        AppointmentStatus newStatus) {

	    if (currentStatus == newStatus) {
	        throw new BusinessException(
	                "Appointment is already in " + currentStatus + " status"
	        );
	    }

	    if (currentStatus == AppointmentStatus.COMPLETED
	            || currentStatus == AppointmentStatus.CANCELLED
	            || currentStatus == AppointmentStatus.NO_SHOW) {

	        throw new BusinessException(
	                "Appointment status cannot be changed from "
	                        + currentStatus
	        );
	    }

	    boolean valid = switch (currentStatus) {

	        case SCHEDULED ->
	                newStatus == AppointmentStatus.CONFIRMED
	                        || newStatus == AppointmentStatus.CANCELLED;

	        case CONFIRMED ->
	                newStatus == AppointmentStatus.CHECKED_IN
	                        || newStatus == AppointmentStatus.CANCELLED
	                        || newStatus == AppointmentStatus.NO_SHOW;

	        case CHECKED_IN ->
	                newStatus == AppointmentStatus.COMPLETED;

	        default -> false;
	    };

	    if (!valid) {
	        throw new BusinessException(
	                "Invalid appointment status transition: "
	                        + currentStatus + " → " + newStatus
	        );
	    }
	}
}