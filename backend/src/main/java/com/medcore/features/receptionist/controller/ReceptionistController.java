package com.medcore.features.receptionist.controller;

import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.PageResponse;
import com.medcore.features.receptionist.dto.request.CreateReceptionistRequest;
import com.medcore.features.receptionist.dto.request.UpdateReceptionistRequest;
import com.medcore.features.receptionist.dto.response.ReceptionistResponse;
import com.medcore.features.receptionist.service.ReceptionistService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.medcore.features.appointment.dto.response.AppointmentResponse;
import com.medcore.features.patient.dto.request.CreatePatientRequest;
import com.medcore.features.patient.dto.response.PatientResponse;
import java.util.List;

@RestController
@RequestMapping("/api/v1/receptionists")
@RequiredArgsConstructor
public class ReceptionistController {

    private final ReceptionistService receptionistService;


     

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ReceptionistResponse> createReceptionist(
            @Valid @RequestBody CreateReceptionistRequest request) {

        return receptionistService.createReceptionist(
                request
        );
    }


    

    @GetMapping("/{receptionistId}")
    public ApiResponse<ReceptionistResponse> getReceptionistById(
            @PathVariable Long receptionistId) {

        return receptionistService.getReceptionistById(
                receptionistId
        );
    }


    

    @GetMapping
    public ApiResponse<List<ReceptionistResponse>>
    getAllReceptionists() {

        return receptionistService.getAllReceptionists();
    }


     

    @PutMapping("/{receptionistId}")
    public ApiResponse<ReceptionistResponse> updateReceptionist(
            @PathVariable Long receptionistId,
            @Valid @RequestBody UpdateReceptionistRequest request) {

        return receptionistService.updateReceptionist(
                receptionistId,
                request
        );
    }


     

    @DeleteMapping("/{receptionistId}")
    public ApiResponse<Void> deleteReceptionist(
            @PathVariable Long receptionistId) {

        return receptionistService.deleteReceptionist(
                receptionistId
        );
    }


    

    @PatchMapping("/{receptionistId}/activate")
    public ApiResponse<ReceptionistResponse>
    activateReceptionist(
            @PathVariable Long receptionistId) {

        return receptionistService.activateReceptionist(
                receptionistId
        );
    }


     
    @PatchMapping("/{receptionistId}/deactivate")
    public ApiResponse<ReceptionistResponse>
    deactivateReceptionist(
            @PathVariable Long receptionistId) {

        return receptionistService.deactivateReceptionist(
                receptionistId
        );
    }
    
    @PostMapping("/patients")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PatientResponse> registerPatient(
            @Valid @RequestBody CreatePatientRequest request) {

        return receptionistService.registerPatient(
                request
        );
    }
    
    @PatchMapping("/appointments/{appointmentId}/check-in")
    public ApiResponse<AppointmentResponse> checkInPatient(
            @PathVariable Long appointmentId) {

        return receptionistService.checkInPatient(
                appointmentId
        );
    }
    
    @GetMapping("/appointments/today")
    public ApiResponse<PageResponse<AppointmentResponse>>
    getTodayAppointments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "startTime") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        return receptionistService.getTodayAppointments(
                page,
                size,
                sortBy,
                sortDir
        );
    }
    @GetMapping("/patients/search")
    public ApiResponse<PageResponse<PatientResponse>> searchPatients(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return receptionistService.searchPatients(
                keyword,
                page,
                size
        );
    }
}