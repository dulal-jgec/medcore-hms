package com.medcore.features.doctor.controller;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.doctor.dto.request.CreateDoctorScheduleRequest;
import com.medcore.features.doctor.dto.request.UpdateDoctorScheduleRequest;
import com.medcore.features.doctor.dto.response.DoctorScheduleResponse;
import com.medcore.features.doctor.service.DoctorScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/doctor-schedules")
@RequiredArgsConstructor
public class DoctorScheduleController {

    private final DoctorScheduleService doctorScheduleService;

    @PostMapping
    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<DoctorScheduleResponse>> createSchedule(
            @Valid @RequestBody CreateDoctorScheduleRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        doctorScheduleService.createSchedule(request)
                );
    }

    @PutMapping("/{scheduleId}")
    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<DoctorScheduleResponse>> updateSchedule(
            @PathVariable Long scheduleId,
            @Valid @RequestBody UpdateDoctorScheduleRequest request) {

        return ResponseEntity.ok(
                doctorScheduleService.updateSchedule(
                        scheduleId,
                        request
                )
        );
    }

    @DeleteMapping("/{scheduleId}")
    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<String>> deleteSchedule(
            @PathVariable Long scheduleId) {

        return ResponseEntity.ok(
                doctorScheduleService.deleteSchedule(scheduleId)
        );
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<List<DoctorScheduleResponse>>> getDoctorSchedules(
            @PathVariable Long doctorId) {

        return ResponseEntity.ok(
                doctorScheduleService.getDoctorSchedules(doctorId)
        );
    }
}