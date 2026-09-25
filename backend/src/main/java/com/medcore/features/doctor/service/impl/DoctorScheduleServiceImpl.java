package com.medcore.features.doctor.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.security.SecurityUtil;
import com.medcore.common.security.TenantContextService;
import com.medcore.features.doctor.dto.request.CreateDoctorScheduleRequest;
import com.medcore.features.doctor.dto.request.UpdateDoctorScheduleRequest;
import com.medcore.features.doctor.dto.response.DoctorScheduleResponse;
import com.medcore.features.doctor.entity.Doctor;
import com.medcore.features.doctor.entity.DoctorSchedule;
import com.medcore.features.doctor.enums.DoctorStatus;
import com.medcore.features.doctor.mapper.DoctorScheduleMapper;
import com.medcore.features.doctor.repository.DoctorRepository;
import com.medcore.features.doctor.repository.DoctorScheduleRepository;
import com.medcore.features.doctor.service.DoctorScheduleService;
import com.medcore.features.user.entity.User;
import com.medcore.features.user.enums.RoleName;
import com.medcore.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

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
    private final UserRepository userRepository;

    @Override
    public ApiResponse<DoctorScheduleResponse> createSchedule(
            CreateDoctorScheduleRequest request) {

        Doctor doctor = resolveTargetDoctorForWrite(request.getDoctorId());

        if (doctor.getStatus() != DoctorStatus.ACTIVE) {
            throw new BusinessException(
                    "Only active doctors can have schedules"
            );
        }

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new BusinessException(
                    "Start time must be before end time"
            );
        }

        validateNoOverlap(
                doctor.getId(),
                request.getDayOfWeek(),
                request.getStartTime(),
                request.getEndTime(),
                null
        );

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

        Doctor doctor = resolveTargetDoctorForRead(doctorId);

        List<DoctorScheduleResponse> schedules =
                scheduleRepository
                        .findByDoctorIdAndDeletedAtIsNull(doctor.getId())
                        .stream()
                        .map(scheduleMapper::toResponse)
                        .toList();

        return ApiResponse.<List<DoctorScheduleResponse>>builder()
                .success(true)
                .message("Doctor schedules fetched successfully")
                .data(schedules)
                .build();
    }

    @Override
    public ApiResponse<DoctorScheduleResponse> updateSchedule(
            Long scheduleId,
            UpdateDoctorScheduleRequest request) {

        DoctorSchedule schedule =
                scheduleRepository.findByIdAndDeletedAtIsNull(scheduleId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Doctor schedule not found"
                                ));

        Doctor doctor = schedule.getDoctor();

        validateWriteAccess(doctor);

        if (doctor.getStatus() != DoctorStatus.ACTIVE) {
            throw new BusinessException(
                    "Only active doctors can have schedules"
            );
        }

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new BusinessException(
                    "Start time must be before end time"
            );
        }

        validateNoOverlap(
                doctor.getId(),
                request.getDayOfWeek(),
                request.getStartTime(),
                request.getEndTime(),
                scheduleId
        );

        schedule.setDayOfWeek(request.getDayOfWeek());
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());
        schedule.setAvailable(request.getAvailable());

        DoctorSchedule updatedSchedule =
                scheduleRepository.save(schedule);

        log.info(
                "Doctor schedule updated: scheduleId={}, doctorId={}, dayOfWeek={}, startTime={}, endTime={}, available={}",
                updatedSchedule.getId(),
                doctor.getId(),
                updatedSchedule.getDayOfWeek(),
                updatedSchedule.getStartTime(),
                updatedSchedule.getEndTime(),
                updatedSchedule.getAvailable()
        );

        return ApiResponse
                .<DoctorScheduleResponse>builder()
                .success(true)
                .message("Doctor schedule updated successfully")
                .data(scheduleMapper.toResponse(updatedSchedule))
                .build();
    }

    @Override
    public ApiResponse<String> deleteSchedule(Long scheduleId) {

        DoctorSchedule schedule =
                scheduleRepository.findByIdAndDeletedAtIsNull(scheduleId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Doctor schedule not found"
                                ));

        Doctor doctor = schedule.getDoctor();

        validateWriteAccess(doctor);

        schedule.setDeletedAt(LocalDateTime.now());

        scheduleRepository.save(schedule);

        log.info(
                "Doctor schedule deleted: scheduleId={}, doctorId={}",
                scheduleId,
                doctor.getId()
        );

        return ApiResponse
                .<String>builder()
                .success(true)
                .message("Doctor schedule deleted successfully")
                .data("Deleted")
                .build();
    }

    private Doctor resolveTargetDoctorForWrite(Long doctorId) {

        RoleName role = getCurrentRole();

        if (role == RoleName.DOCTOR) {
            Doctor self = getCurrentDoctor();

            if (!self.getId().equals(doctorId)) {
                throw new BusinessException(
                        "You can only manage your own schedule"
                );
            }

            return self;
        }

        if (role == RoleName.HOSPITAL_ADMIN) {
            Long currentHospitalId = getRequiredHospitalId();

            return doctorRepository
                    .findByIdAndHospitalIdAndDeletedAtIsNull(
                            doctorId,
                            currentHospitalId
                    )
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Doctor not found"
                            ));
        }

        return doctorRepository
                .findByIdAndDeletedAtIsNull(doctorId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Doctor not found"
                        ));
    }

    private Doctor resolveTargetDoctorForRead(Long doctorId) {

        RoleName role = getCurrentRole();

        if (role == RoleName.DOCTOR) {
            Doctor self = getCurrentDoctor();

            if (!self.getId().equals(doctorId)) {
                throw new ResourceNotFoundException(
                        "Doctor not found"
                );
            }

            return self;
        }

        if (role == RoleName.HOSPITAL_ADMIN) {
            Long currentHospitalId = getRequiredHospitalId();

            return doctorRepository
                    .findByIdAndHospitalIdAndDeletedAtIsNull(
                            doctorId,
                            currentHospitalId
                    )
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Doctor not found"
                            ));
        }

        return doctorRepository
                .findByIdAndDeletedAtIsNull(doctorId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Doctor not found"
                        ));
    }

    private void validateWriteAccess(Doctor doctor) {

        RoleName role = getCurrentRole();

        if (role == RoleName.DOCTOR) {
            Doctor self = getCurrentDoctor();

            if (!self.getId().equals(doctor.getId())) {
                throw new ResourceNotFoundException(
                        "Doctor schedule not found"
                );
            }

            return;
        }

        if (role == RoleName.HOSPITAL_ADMIN) {
            Long currentHospitalId = getRequiredHospitalId();

            if (doctor.getHospital() == null
                    || !doctor.getHospital().getId().equals(currentHospitalId)) {

                throw new ResourceNotFoundException(
                        "Doctor schedule not found"
                );
            }
        }
    }

    private void validateNoOverlap(
            Long doctorId,
            com.medcore.features.doctor.enums.DayOfWeek dayOfWeek,
            java.time.LocalTime startTime,
            java.time.LocalTime endTime,
            Long ignoreScheduleId) {

        List<DoctorSchedule> existingSchedules =
                scheduleRepository
                        .findByDoctorIdAndDayOfWeekAndDeletedAtIsNull(
                                doctorId,
                                dayOfWeek
                        );

        for (DoctorSchedule existing : existingSchedules) {

            if (ignoreScheduleId != null
                    && existing.getId().equals(ignoreScheduleId)) {
                continue;
            }

            boolean overlap =
                    startTime.isBefore(existing.getEndTime())
                    && endTime.isAfter(existing.getStartTime());

            if (overlap) {
                throw new BusinessException(
                        "Doctor already has a schedule during this time"
                );
            }
        }
    }

    private Doctor getCurrentDoctor() {

        String email = SecurityUtil.getCurrentUsername();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Current user not found"
                        ));

        return doctorRepository
                .findByUserIdAndDeletedAtIsNull(user.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Doctor profile not found"
                        ));
    }

    private RoleName getCurrentRole() {

        String email = SecurityUtil.getCurrentUsername();

        User user = userRepository
                .findByEmailWithRole(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Current user not found"
                        ));

        return user.getRole().getName();
    }

    private Long getRequiredHospitalId() {

        Long hospitalId = tenantContextService.getCurrentHospitalId();

        if (hospitalId == null) {
            throw new BusinessException(
                    "User is not associated with a hospital"
            );
        }

        return hospitalId;
    }
}