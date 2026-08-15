package com.medcore.features.doctor.controller;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.doctor.dto.request.CreateDoctorScheduleRequest;
import com.medcore.features.doctor.dto.response.DoctorScheduleResponse;
import com.medcore.features.doctor.service.DoctorScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

@RestController
@RequestMapping("/api/v1/doctor-schedules")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN')")
public class DoctorScheduleController {

    private final DoctorScheduleService doctorScheduleService;
    

    @PostMapping
    public ResponseEntity<ApiResponse<DoctorScheduleResponse>> createSchedule(
            @Valid @RequestBody CreateDoctorScheduleRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(doctorScheduleService.createSchedule(request));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<List<DoctorScheduleResponse>>> getDoctorSchedules(
            @PathVariable Long doctorId) {

        return ResponseEntity.ok(
                doctorScheduleService.getDoctorSchedules(doctorId)
        );
    }
}