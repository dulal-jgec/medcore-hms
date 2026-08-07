package com.medcore.features.doctor.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
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

import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorScheduleServiceImpl
        implements DoctorScheduleService {

    private final DoctorRepository doctorRepository;
    private final DoctorScheduleRepository scheduleRepository;
    private final DoctorScheduleMapper scheduleMapper;

    @Override
    public ApiResponse<DoctorScheduleResponse> createSchedule(
            CreateDoctorScheduleRequest request) {

        Doctor doctor = doctorRepository
                .findByIdAndDeletedAtIsNull(request.getDoctorId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Doctor not found"));

        // Validate time
        if (request.getStartTime().isAfter(request.getEndTime())
                || request.getStartTime().equals(request.getEndTime())) {

            throw new BusinessException(
                    "Start time must be before end time");
        }
        
        

        // Fetch existing schedules for the same day
        List<DoctorSchedule> existingSchedules =
                scheduleRepository.findByDoctorIdAndDayOfWeekAndDeletedAtIsNull(
                        doctor.getId(),
                        request.getDayOfWeek()
                );
        
        if (doctor.getStatus() != DoctorStatus.ACTIVE) {
            throw new BusinessException(
                    "Only active doctors can have schedules");
        }

        // Check overlapping schedules
        for (DoctorSchedule existingSchedule : existingSchedules) {

            boolean overlap =
                    request.getStartTime().isBefore(existingSchedule.getEndTime())
                            &&
                    request.getEndTime().isAfter(existingSchedule.getStartTime());

            if (overlap) {
                throw new BusinessException(
                        "Doctor already has a schedule during this time");
            }
        }

        DoctorSchedule schedule =
                scheduleMapper.toEntity(request, doctor);

        DoctorSchedule savedSchedule =
                scheduleRepository.save(schedule);

        return ApiResponse.<DoctorScheduleResponse>builder()
                .success(true)
                .message("Doctor schedule created successfully")
                .data(scheduleMapper.toResponse(savedSchedule))
                .build();
    }

    @Override
    public ApiResponse<List<DoctorScheduleResponse>> getDoctorSchedules(
            Long doctorId) {

        Doctor doctor = doctorRepository
                .findByIdAndDeletedAtIsNull(doctorId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Doctor not found"));

        List<DoctorScheduleResponse> schedules =
                scheduleRepository.findByDoctorIdAndDeletedAtIsNull(doctor.getId())
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