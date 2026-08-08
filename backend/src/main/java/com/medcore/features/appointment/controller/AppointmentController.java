package com.medcore.features.appointment.controller;

import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.PageResponse;
import com.medcore.features.appointment.dto.request.CreateAppointmentRequest;
import com.medcore.features.appointment.dto.request.UpdateAppointmentStatusRequest;
import com.medcore.features.appointment.dto.response.AppointmentResponse;
import com.medcore.features.appointment.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentResponse>> createAppointment(
            @Valid @RequestBody CreateAppointmentRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(appointmentService.createAppointment(request));
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AppointmentResponse>>> getAllAppointments(

            @RequestParam(defaultValue = "0") int page,

            @RequestParam(defaultValue = "10") int size,

            @RequestParam(defaultValue = "appointmentDate") String sortBy,

            @RequestParam(defaultValue = "asc") String sortDir) {

        return ResponseEntity.ok(
                appointmentService.getAllAppointments(
                        page,
                        size,
                        sortBy,
                        sortDir
                )
        );
    }
    
    @GetMapping("/{appointmentId}")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getAppointmentById(
            @PathVariable Long appointmentId) {

        return ResponseEntity.ok(
                appointmentService.getAppointmentById(appointmentId)
        );
    }
    
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<PageResponse<AppointmentResponse>>>
    getDoctorAppointments(
            @PathVariable Long doctorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(
                appointmentService.getDoctorAppointments(
                        doctorId,
                        page,
                        size
                )
        );
    }
    
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<PageResponse<AppointmentResponse>>>
    getPatientAppointments(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(
                appointmentService.getPatientAppointments(
                        patientId,
                        page,
                        size
                )
        );
    }
    
    @PatchMapping("/{appointmentId}/status")
    public ResponseEntity<ApiResponse<AppointmentResponse>>
    updateAppointmentStatus(
            @PathVariable Long appointmentId,
            @Valid @RequestBody UpdateAppointmentStatusRequest
            request) {

        return ResponseEntity.ok(
                appointmentService.updateAppointmentStatus(
                        appointmentId,
                        request
                )
        );
    }
    
    @PatchMapping("/{appointmentId}/cancel")
    public ResponseEntity<ApiResponse<String>> cancelAppointment(
            @PathVariable Long appointmentId) {

        return ResponseEntity.ok(
                appointmentService.cancelAppointment(appointmentId)
        );
    }
    
    @DeleteMapping("/{appointmentId}")
    public ResponseEntity<ApiResponse<String>> deleteAppointment(
            @PathVariable Long appointmentId) {

        return ResponseEntity.ok(
                appointmentService.deleteAppointment(appointmentId)
        );
    }
    
    @PatchMapping("/{appointmentId}/restore")
    public ResponseEntity<ApiResponse<String>> restoreAppointment(
            @PathVariable Long appointmentId) {

        return ResponseEntity.ok(
                appointmentService.restoreAppointment(appointmentId)
        );
    }
}