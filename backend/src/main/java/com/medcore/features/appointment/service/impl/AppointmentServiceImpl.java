package com.medcore.features.appointment.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.PageResponse;
import com.medcore.common.security.SecurityUtil;
import com.medcore.common.security.TenantContextService;

import com.medcore.features.appointment.dto.request.CreateAppointmentRequest;
import com.medcore.features.appointment.dto.request.UpdateAppointmentStatusRequest;
import com.medcore.features.appointment.dto.response.AppointmentResponse;
import com.medcore.features.appointment.dto.response.AvailableSlotResponse;
import com.medcore.features.appointment.entity.Appointment;
import com.medcore.features.appointment.enums.AppointmentStatus;
import com.medcore.features.appointment.mapper.AppointmentMapper;
import com.medcore.features.appointment.repository.AppointmentRepository;
import com.medcore.features.appointment.service.AppointmentService;

import com.medcore.features.doctor.entity.Doctor;
import com.medcore.features.doctor.entity.DoctorSchedule;
import com.medcore.features.doctor.enums.DoctorStatus;
import com.medcore.features.doctor.repository.DoctorRepository;
import com.medcore.features.doctor.repository.DoctorScheduleRepository;

import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.repository.HospitalRepository;

import com.medcore.features.patient.entity.Patient;
import com.medcore.features.patient.enums.PatientStatus;
import com.medcore.features.patient.repository.PatientRepository;

import com.medcore.features.user.entity.User;
import com.medcore.features.user.enums.RoleName;
import com.medcore.features.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl
        implements AppointmentService {

    private static final Logger log =
            LoggerFactory.getLogger(AppointmentServiceImpl.class);

    private final AppointmentRepository appointmentRepository;
    private final HospitalRepository hospitalRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final DoctorScheduleRepository doctorScheduleRepository;
    private final AppointmentMapper appointmentMapper;
    private final TenantContextService tenantContextService;
    private final UserRepository userRepository;


     

    @Override
    @Transactional
    public ApiResponse<AppointmentResponse> createAppointment(
            CreateAppointmentRequest request) {

        Long currentHospitalId =
                tenantContextService.getCurrentHospitalId();

        RoleName currentRole = getCurrentRole();

        Long hospitalId;
        Patient patient;

         

        if (currentRole == RoleName.PATIENT) {

            if (request.getHospitalId() == null) {
                throw new BusinessException(
                        "Hospital is required for appointment"
                );
            }

            hospitalId = request.getHospitalId();

            patient = getCurrentPatient();

        }

         // RECEPTIONIST
 
        else if (currentRole == RoleName.RECEPTIONIST) {

            if (currentHospitalId == null) {
                throw new BusinessException(
                        "Hospital context is required"
                );
            }

            hospitalId = currentHospitalId;

            if (request.getPatientId() == null) {
                throw new BusinessException(
                        "Patient id is required"
                );
            }

            patient = patientRepository
                    .findByIdAndDeletedAtIsNull(
                            request.getPatientId()
                    )
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Patient not found"
                            )
                    );

        } else {

            throw new BusinessException(
                    "Only patient and receptionist can create appointments"
            );
        }


         // HOSPITAL
 
        Hospital hospital =
                hospitalRepository
                        .findByIdAndDeletedAtIsNull(hospitalId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Hospital not found"
                                )
                        );


         // DOCTOR
 
        Doctor doctor =
                doctorRepository
                        .findByIdAndDeletedAtIsNull(
                                request.getDoctorId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Doctor not found"
                                )
                        );


 
        if (!doctor.getHospital().getId().equals(hospitalId)) {

            throw new BusinessException(
                    "Doctor does not belong to the selected hospital"
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


         

        if (request.getAppointmentDate()
                .isBefore(LocalDate.now())) {

            throw new BusinessException(
                    "Appointment date cannot be in the past"
            );
        }


         

        com.medcore.features.doctor.enums.DayOfWeek dayOfWeek =
                com.medcore.features.doctor.enums.DayOfWeek.valueOf(
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


         

        LocalTime startTime =
                request.getStartTime();

        int duration =
                doctor.getConsultationDurationMinutes();

        if (duration <= 0) {

            throw new BusinessException(
                    "Doctor consultation duration is not configured"
            );
        }


        // Backend calculates end time.
        LocalTime endTime =
                startTime.plusMinutes(duration);


        
        boolean validSlot = schedules.stream()
                .filter(schedule ->
                        Boolean.TRUE.equals(
                                schedule.getAvailable()
                        )
                )
                .anyMatch(schedule ->
                        !startTime.isBefore(
                                schedule.getStartTime()
                        )
                        &&
                        !endTime.isAfter(
                                schedule.getEndTime()
                        )
                );

        if (!validSlot) {

            throw new BusinessException(
                    "Selected time is not a valid appointment slot"
            );
        }


        

        boolean alreadyBooked =
                appointmentRepository.existsOverlappingAppointment(
                        doctor.getId(),
                        request.getAppointmentDate(),
                        startTime,
                        endTime
                );

        if (alreadyBooked) {

            throw new BusinessException(
                    "Selected appointment slot is already booked"
            );
        }


        

        Appointment appointment =
                appointmentMapper.toEntity(
                        request,
                        hospital,
                        doctor,
                        patient
                );

        // Mapper should calculate/set these from request/doctor.
        // If mapper currently needs endTime, we will update it next.


        Appointment savedAppointment =
                appointmentRepository.save(
                        appointment
                );


        log.info(
                "Appointment created: appointmentId={}, hospitalId={}, doctorId={}, patientId={}, appointmentDate={}, startTime={}, endTime={}",
                savedAppointment.getId(),
                hospitalId,
                doctor.getId(),
                patient.getId(),
                request.getAppointmentDate(),
                startTime,
                endTime
        );


        return ApiResponse
                .<AppointmentResponse>builder()
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
    public ApiResponse<List<AvailableSlotResponse>> getAvailableSlots(
            Long doctorId,
            LocalDate appointmentDate) {

        

        Doctor doctor =
                doctorRepository
                        .findByIdAndDeletedAtIsNull(doctorId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Doctor not found"
                                )
                        );


        

        if (doctor.getStatus() != DoctorStatus.ACTIVE) {

            throw new BusinessException(
                    "Appointments are not available for this doctor"
            );
        }


         

        com.medcore.features.doctor.enums.DayOfWeek dayOfWeek =
                com.medcore.features.doctor.enums.DayOfWeek.valueOf(
                        appointmentDate
                                .getDayOfWeek()
                                .name()
                );

        List<DoctorSchedule> schedules =
                doctorScheduleRepository
                        .findByDoctorIdAndDayOfWeekAndDeletedAtIsNull(
                                doctorId,
                                dayOfWeek
                        );


        List<AvailableSlotResponse> slots =
                new ArrayList<>();


        int duration =
                doctor.getConsultationDurationMinutes();


        if (duration <= 0) {

            throw new BusinessException(
                    "Doctor consultation duration is not configured"
            );
        }


        
        for (DoctorSchedule schedule : schedules) {

            // Skip unavailable schedule
            if (!Boolean.TRUE.equals(
                    schedule.getAvailable()
            )) {
                continue;
            }


            LocalTime slotStart =
                    schedule.getStartTime();


            while (!slotStart
                    .plusMinutes(duration)
                    .isAfter(schedule.getEndTime())) {

                LocalTime slotEnd =
                        slotStart.plusMinutes(duration);


                boolean booked =
                        appointmentRepository
                                .existsOverlappingAppointment(
                                        doctorId,
                                        appointmentDate,
                                        slotStart,
                                        slotEnd
                                );


                slots.add(
                        AvailableSlotResponse
                                .builder()
                                .startTime(slotStart)
                                .endTime(slotEnd)
                                .available(!booked)
                                .build()
                );


                slotStart = slotEnd;
            }
        }


        return ApiResponse
                .<List<AvailableSlotResponse>>builder()
                .success(true)
                .message(
                        "Appointment slots fetched successfully"
                )
                .data(slots)
                .build();
    }


 
    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<AppointmentResponse>>
    getAllAppointments(
            int page,
            int size,
            String sortBy,
            String sortDir) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();


        validatePagination(page, size);


        Set<String> allowedSortFields =
                Set.of(
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


        sortDir =
                sortDir.trim().toLowerCase();


        if (!sortDir.equals("asc")
                && !sortDir.equals("desc")) {

            throw new BusinessException(
                    "Sort direction must be 'asc' or 'desc'"
            );
        }


        Sort sort =
                sortDir.equals("desc")
                        ? Sort.by(sortBy).descending()
                        : Sort.by(sortBy).ascending();


        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        sort
                );


        Page<Appointment> appointmentPage;


        if (hospitalId == null) {

            appointmentPage =
                    appointmentRepository
                            .findByDeletedAtIsNull(
                                    pageable
                            );

        } else {

            appointmentPage =
                    appointmentRepository
                            .findByHospitalIdAndDeletedAtIsNull(
                                    hospitalId,
                                    pageable
                            );
        }


        return buildPageResponse(
                appointmentPage,
                "Appointments fetched successfully"
        );
    }


   
    @Override
    @Transactional(readOnly = true)
    public ApiResponse<AppointmentResponse>
    getAppointmentById(Long appointmentId) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();


        Appointment appointment;


        if (hospitalId == null) {

            appointment =
                    appointmentRepository
                            .findByIdAndDeletedAtIsNull(
                                    appointmentId
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Appointment not found"
                                    )
                            );

        } else {

            appointment =
                    appointmentRepository
                            .findByIdAndHospitalIdAndDeletedAtIsNull(
                                    appointmentId,
                                    hospitalId
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Appointment not found"
                                    )
                            );
        }


        return ApiResponse
                .<AppointmentResponse>builder()
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
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<AppointmentResponse>>
    getDoctorAppointments(
            Long doctorId,
            int page,
            int size) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();


        validatePagination(page, size);


        Doctor doctor;


        if (hospitalId == null) {

            doctor =
                    doctorRepository
                            .findByIdAndDeletedAtIsNull(
                                    doctorId
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Doctor not found"
                                    )
                            );

        } else {

            doctor =
                    doctorRepository
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


        Pageable pageable =
                PageRequest.of(
                        page,
                        size
                );


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


        return buildPageResponse(
                appointmentPage,
                "Doctor appointments fetched successfully"
        );
    }


   
    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<AppointmentResponse>>
    getPatientAppointments(
            Long patientId,
            int page,
            int size) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();


        validatePagination(page, size);


        Patient patient =
                patientRepository
                        .findByIdAndDeletedAtIsNull(
                                patientId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Patient not found"
                                )
                        );


        Pageable pageable =
                PageRequest.of(
                        page,
                        size
                );


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


        return buildPageResponse(
                appointmentPage,
                "Patient appointments fetched successfully"
        );
    }


  
    @Override
    @Transactional
    public ApiResponse<AppointmentResponse>
    updateAppointmentStatus(
            Long appointmentId,
            UpdateAppointmentStatusRequest request) {

        Appointment appointment =
                getHospitalScopedAppointment(
                        appointmentId
                );


        AppointmentStatus currentStatus =
                appointment.getStatus();

        AppointmentStatus newStatus =
                request.getStatus();


        validateStatusTransition(
                currentStatus,
                newStatus
        );


        appointment.setStatus(newStatus);


        Appointment savedAppointment =
                appointmentRepository.save(
                        appointment
                );


        return ApiResponse
                .<AppointmentResponse>builder()
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
    @Transactional
    public ApiResponse<String>
    cancelAppointment(Long appointmentId) {

        Appointment appointment =
                getHospitalScopedAppointment(
                        appointmentId
                );


        if (appointment.getStatus()
                == AppointmentStatus.CHECKED_IN) {

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


        appointmentRepository.save(
                appointment
        );


        return ApiResponse
                .<String>builder()
                .success(true)
                .message(
                        "Appointment cancelled successfully"
                )
                .data("Cancelled")
                .build();
    }


     

    @Override
    @Transactional
    public ApiResponse<String>
    deleteAppointment(Long appointmentId) {

        Appointment appointment =
                getHospitalScopedAppointment(
                        appointmentId
                );


        appointment.setDeletedAt(
                LocalDateTime.now()
        );


        appointmentRepository.save(
                appointment
        );


        return ApiResponse
                .<String>builder()
                .success(true)
                .message(
                        "Appointment deleted successfully"
                )
                .data("Deleted")
                .build();
    }


   

    @Override
    @Transactional
    public ApiResponse<String>
    restoreAppointment(Long appointmentId) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();


        Appointment appointment;


        if (hospitalId == null) {

            appointment =
                    appointmentRepository
                            .findById(appointmentId)
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Appointment not found"
                                    )
                            );

        } else {

            appointment =
                    appointmentRepository
                            .findByIdAndHospitalId(
                                    appointmentId,
                                    hospitalId
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Appointment not found"
                                    )
                            );
        }


        if (appointment.getDeletedAt() == null) {

            throw new BusinessException(
                    "Appointment is already active"
            );
        }


        appointment.setDeletedAt(null);


        appointmentRepository.save(
                appointment
        );


        return ApiResponse
                .<String>builder()
                .success(true)
                .message(
                        "Appointment restored successfully"
                )
                .data("Restored")
                .build();
    }


    

    @Override
    @Transactional
    public ApiResponse<AppointmentResponse>
    checkInAppointment(Long appointmentId) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();


        if (hospitalId == null) {

            throw new BusinessException(
                    "Hospital context is required for check-in"
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
                                )
                        );


        if (appointment.getStatus()
                != AppointmentStatus.SCHEDULED
                &&
                appointment.getStatus()
                != AppointmentStatus.CONFIRMED) {

            throw new BusinessException(
                    "Only scheduled or confirmed appointments can be checked in"
            );
        }


        appointment.setStatus(
                AppointmentStatus.CHECKED_IN
        );


        Appointment savedAppointment =
                appointmentRepository.save(
                        appointment
                );


        return ApiResponse
                .<AppointmentResponse>builder()
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


    

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<AppointmentResponse>>
    getTodayAppointments(
            int page,
            int size,
            String sortBy,
            String sortDir) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();


        if (hospitalId == null) {

            throw new BusinessException(
                    "Hospital context is required"
            );
        }


        validatePagination(page, size);


        Set<String> allowedSortFields =
                Set.of(
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


        sortDir =
                sortDir.trim().toLowerCase();


        if (!sortDir.equals("asc")
                && !sortDir.equals("desc")) {

            throw new BusinessException(
                    "Sort direction must be 'asc' or 'desc'"
            );
        }


        Sort sort =
                sortDir.equals("desc")
                        ? Sort.by(sortBy).descending()
                        : Sort.by(sortBy).ascending();


        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        sort
                );


        Page<Appointment> appointments =
                appointmentRepository
                        .findByHospitalIdAndAppointmentDateAndDeletedAtIsNull(
                                hospitalId,
                                LocalDate.now(),
                                pageable
                        );


        return buildPageResponse(
                appointments,
                "Today's appointments fetched successfully"
        );
    }
    
    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<AppointmentResponse>> getMyAppointments(
            int page, int size, String sortBy, String sortDir) {

        validatePagination(page, size);

        Set<String> allowedSortFields =
                Set.of("startTime", "endTime", "appointmentDate", "createdAt");

        if (!allowedSortFields.contains(sortBy)) {
            throw new BusinessException("Invalid sort field: " + sortBy);
        }

        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir)
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        RoleName role = getCurrentRole();
        Page<Appointment> appointmentPage;

        switch (role) {
            case PATIENT -> {
                Patient patient = getCurrentPatient();
                appointmentPage = appointmentRepository
                        .findByPatientIdAndDeletedAtIsNull(patient.getId(), pageable);
            }
            case DOCTOR -> {
                Doctor doctor = getCurrentDoctor();
                appointmentPage = appointmentRepository
                        .findByDoctorIdAndDeletedAtIsNull(doctor.getId(), pageable);
            }
            default -> {
                Long hospitalId = tenantContextService.getCurrentHospitalId();
                if (hospitalId == null) {
                    appointmentPage = appointmentRepository.findByDeletedAtIsNull(pageable);
                } else {
                    appointmentPage = appointmentRepository
                            .findByHospitalIdAndDeletedAtIsNull(hospitalId, pageable);
                }
            }
        }

        return buildPageResponse(appointmentPage, "My appointments fetched successfully");
    }

    private Doctor getCurrentDoctor() {
        String email = SecurityUtil.getCurrentUsername();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));

        return doctorRepository.findByUserIdAndDeletedAtIsNull(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
    }


     

    private RoleName getCurrentRole() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();


        if (authentication == null
                || authentication.getName() == null) {

            throw new BusinessException(
                    "Authenticated user not found"
            );
        }


        User user =
                userRepository
                        .findByEmailWithRole(
                                authentication.getName()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found"
                                )
                        );


        return user.getRole().getName();
    }


    private Patient getCurrentPatient() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();


        if (authentication == null
                || authentication.getName() == null) {

            throw new BusinessException(
                    "Authenticated user not found"
            );
        }


        User user =
                userRepository
                        .findByEmailWithRole(
                                authentication.getName()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found"
                                )
                        );


        return patientRepository
                .findByUserIdAndDeletedAtIsNull(
                        user.getId()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Patient profile not found"
                        )
                );
    }


    private Appointment getHospitalScopedAppointment(
            Long appointmentId) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();


        if (hospitalId == null) {

            return appointmentRepository
                    .findByIdAndDeletedAtIsNull(
                            appointmentId
                    )
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Appointment not found"
                            )
                    );
        }


        return appointmentRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(
                        appointmentId,
                        hospitalId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Appointment not found"
                        )
                );
    }


    private void validatePagination(
            int page,
            int size) {

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
    }


    private ApiResponse<PageResponse<AppointmentResponse>>
    buildPageResponse(
            Page<Appointment> appointmentPage,
            String message) {

        List<AppointmentResponse> items =
                appointmentPage
                        .getContent()
                        .stream()
                        .map(appointmentMapper::toResponse)
                        .toList();


        PageResponse<AppointmentResponse> response =
                PageResponse
                        .<AppointmentResponse>builder()
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
                .message(message)
                .data(response)
                .build();
    }


    private void validateStatusTransition(
            AppointmentStatus currentStatus,
            AppointmentStatus newStatus) {

        if (currentStatus == newStatus) {

            throw new BusinessException(
                    "Appointment is already in "
                            + currentStatus
                            + " status"
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


        boolean valid =
                switch (currentStatus) {

                    case SCHEDULED ->
                            newStatus
                                    == AppointmentStatus.CONFIRMED
                                    || newStatus
                                    == AppointmentStatus.CANCELLED;

                    case CONFIRMED ->
                            newStatus
                                    == AppointmentStatus.CHECKED_IN
                                    || newStatus
                                    == AppointmentStatus.CANCELLED
                                    || newStatus
                                    == AppointmentStatus.NO_SHOW;

                    case CHECKED_IN ->
                            newStatus
                                    == AppointmentStatus.COMPLETED;

                    default -> false;
                };


        if (!valid) {

            throw new BusinessException(
                    "Invalid appointment status transition: "
                            + currentStatus
                            + " → "
                            + newStatus
            );
        }
    }
}