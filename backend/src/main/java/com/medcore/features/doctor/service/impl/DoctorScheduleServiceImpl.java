package com.medcore.features.doctor.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.security.TenantContextService;
import com.medcore.features.doctor.dto.request.CreateDoctorScheduleRequest;
import com.medcore.features.doctor.dto.response.DoctorScheduleResponse;
import com.medcore.features.doctor.entity.Doctor;
import com.medcore.features.doctor.entity.DoctorSchedule;
import com.medcore.features.doctor.enums.DoctorStatus;
import com.medcore.features.doctor.mapper.DoctorScheduleMapper;
import com.medcore.features.doctor.repository.DoctorRepository;
import com.medcore.features.doctor.repository.DoctorScheduleRepository;
import com.medcore.features.doctor.service.DoctorScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
@Transactional
public class DoctorScheduleServiceImpl
        implements DoctorScheduleService {
	
	private static final Logger log =
	        LoggerFactory.getLogger(DoctorScheduleServiceImpl.class);

    private final DoctorRepository doctorRepository;
    private final DoctorScheduleRepository scheduleRepository;
    private final DoctorScheduleMapper scheduleMapper;
    private final TenantContextService tenantContextService;

    @Override
    public ApiResponse<DoctorScheduleResponse> createSchedule(
            CreateDoctorScheduleRequest request) {

        Long currentHospitalId =
                tenantContextService.getCurrentHospitalId();

        Doctor doctor;

        if (currentHospitalId == null) {

            // SUPER_ADMIN → any hospital
            doctor = doctorRepository
                    .findByIdAndDeletedAtIsNull(request.getDoctorId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Doctor not found"
                            )
                    );

        } else {

            // HOSPITAL_ADMIN → own hospital only
            doctor = doctorRepository
                    .findByIdAndHospitalIdAndDeletedAtIsNull(
                            request.getDoctorId(),
                            currentHospitalId
                    )
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Doctor not found"
                            )
                    );
        }

        // Doctor must be active
        if (doctor.getStatus() != DoctorStatus.ACTIVE) {
            throw new BusinessException(
                    "Only active doctors can have schedules"
            );
        }

        // Start time must be before end time
        if (!request.getStartTime().isBefore(
                request.getEndTime())) {

            throw new BusinessException(
                    "Start time must be before end time"
            );
        }

        // Existing schedules for same doctor + same day
        List<DoctorSchedule> existingSchedules =
                scheduleRepository
                        .findByDoctorIdAndDayOfWeekAndDeletedAtIsNull(
                                doctor.getId(),
                                request.getDayOfWeek()
                        );

        // Check overlapping schedules
        for (DoctorSchedule existingSchedule :
                existingSchedules) {

            boolean overlap =
                    request.getStartTime()
                            .isBefore(existingSchedule.getEndTime())
                    &&
                    request.getEndTime()
                            .isAfter(existingSchedule.getStartTime());

            if (overlap) {
                throw new BusinessException(
                        "Doctor already has a schedule during this time"
                );
            }
        }

        DoctorSchedule schedule =
                scheduleMapper.toEntity(request, doctor);

        DoctorSchedule savedSchedule =
                scheduleRepository.save(schedule);
        
        log.info(
                "Doctor schedule created: scheduleId={}, doctorId={}, dayOfWeek={}, startTime={}, endTime={}",
                savedSchedule.getId(),
                doctor.getId(),
                savedSchedule.getDayOfWeek(),
                savedSchedule.getStartTime(),
                savedSchedule.getEndTime()
        );

        return ApiResponse.<DoctorScheduleResponse>builder()
                .success(true)
                .message("Doctor schedule created successfully")
                .data(scheduleMapper.toResponse(savedSchedule))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<DoctorScheduleResponse>> getDoctorSchedules(
            Long doctorId) {

        Long currentHospitalId =
                tenantContextService.getCurrentHospitalId();

        Doctor doctor;

        if (currentHospitalId == null) {

            // SUPER_ADMIN → any hospital
            doctor = doctorRepository
                    .findByIdAndDeletedAtIsNull(doctorId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Doctor not found"
                            )
                    );

        } else {

            // HOSPITAL_ADMIN → own hospital only
            doctor = doctorRepository
                    .findByIdAndHospitalIdAndDeletedAtIsNull(
                            doctorId,
                            currentHospitalId
                    )
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Doctor not found"
                            )
                    );
        }

        List<DoctorScheduleResponse> schedules =
                scheduleRepository
                        .findByDoctorIdAndDeletedAtIsNull(
                                doctor.getId()
                        )
                        .stream()
                        .map(scheduleMapper::toResponse)
                        .toList();

        return ApiResponse.<List<DoctorScheduleResponse>>builder()
                .success(true)
                .message("Doctor schedules fetched successfully")
                .data(schedules)
                .build();
    }
}