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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
@PreAuthorize("""
    hasAnyRole(
        'SUPER_ADMIN',
        'HOSPITAL_ADMIN',
        'RECEPTIONIST',
        'DOCTOR',
        'PATIENT'
    )
""")
public class AppointmentController {

    private final AppointmentService appointmentService;


     
    // CREATE APPOINTMENT
   

    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentResponse>> createAppointment(
            @Valid @RequestBody CreateAppointmentRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        appointmentService.createAppointment(request)
                );
    }


     
    // GET ALL APPOINTMENTS
     

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AppointmentResponse>>>
    getAllAppointments(

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size,

            @RequestParam(defaultValue = "appointmentDate")
            String sortBy,

            @RequestParam(defaultValue = "asc")
            String sortDir) {

        return ResponseEntity.ok(
                appointmentService.getAllAppointments(
                        page,
                        size,
                        sortBy,
                        sortDir
                )
        );
    }


     
    // TODAY'S APPOINTMENTS
    

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<PageResponse<AppointmentResponse>>>
    getTodayAppointments(

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size,

            @RequestParam(defaultValue = "startTime")
            String sortBy,

            @RequestParam(defaultValue = "asc")
            String sortDir) {

        return ResponseEntity.ok(
                appointmentService.getTodayAppointments(
                        page,
                        size,
                        sortBy,
                        sortDir
                )
        );
    }


     
    // DOCTOR APPOINTMENTS
     

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<PageResponse<AppointmentResponse>>>
    getDoctorAppointments(

            @PathVariable Long doctorId,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size) {

        return ResponseEntity.ok(
                appointmentService.getDoctorAppointments(
                        doctorId,
                        page,
                        size
                )
        );
    }


     
    // PATIENT APPOINTMENTS
     

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<PageResponse<AppointmentResponse>>>
    getPatientAppointments(

            @PathVariable Long patientId,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size) {

        return ResponseEntity.ok(
                appointmentService.getPatientAppointments(
                        patientId,
                        page,
                        size
                )
        );
    }


    
    // GET APPOINTMENT BY ID
   

    @GetMapping("/{appointmentId}")
    public ResponseEntity<ApiResponse<AppointmentResponse>>
    getAppointmentById(
            @PathVariable Long appointmentId) {

        return ResponseEntity.ok(
                appointmentService.getAppointmentById(
                        appointmentId
                )
        );
    }


     
    // UPDATE STATUS
    

    @PatchMapping("/{appointmentId}/status")
    public ResponseEntity<ApiResponse<AppointmentResponse>>
    updateAppointmentStatus(

            @PathVariable Long appointmentId,

            @Valid
            @RequestBody UpdateAppointmentStatusRequest request) {

        return ResponseEntity.ok(
                appointmentService.updateAppointmentStatus(
                        appointmentId,
                        request
                )
        );
    }


   
    // CHECK-IN
     

    @PatchMapping("/{appointmentId}/check-in")
    public ResponseEntity<ApiResponse<AppointmentResponse>>
    checkInAppointment(
            @PathVariable Long appointmentId) {

        return ResponseEntity.ok(
                appointmentService.checkInAppointment(
                        appointmentId
                )
        );
    }


    
    // CANCEL APPOINTMENT
     

    @PatchMapping("/{appointmentId}/cancel")
    public ResponseEntity<ApiResponse<String>>
    cancelAppointment(
            @PathVariable Long appointmentId) {

        return ResponseEntity.ok(
                appointmentService.cancelAppointment(
                        appointmentId
                )
        );
    }


     
    // DELETE APPOINTMENT
    

    @DeleteMapping("/{appointmentId}")
    public ResponseEntity<ApiResponse<String>>
    deleteAppointment(
            @PathVariable Long appointmentId) {

        return ResponseEntity.ok(
                appointmentService.deleteAppointment(
                        appointmentId
                )
        );
    }


     
    // RESTORE APPOINTMENT
    

    @PatchMapping("/{appointmentId}/restore")
    public ResponseEntity<ApiResponse<String>>
    restoreAppointment(
            @PathVariable Long appointmentId) {

        return ResponseEntity.ok(
                appointmentService.restoreAppointment(
                        appointmentId
                )
        );
    }
}