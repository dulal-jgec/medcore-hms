package com.medcore.features.receptionist.service;

import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.PageResponse;
import com.medcore.features.appointment.dto.response.AppointmentResponse;
import com.medcore.features.patient.dto.request.CreatePatientRequest;
import com.medcore.features.patient.dto.response.PatientResponse;
import com.medcore.features.receptionist.dto.request.CreateReceptionistRequest;
import com.medcore.features.receptionist.dto.request.UpdateReceptionistRequest;
import com.medcore.features.receptionist.dto.response.ReceptionistResponse;

import java.util.List;

public interface ReceptionistService {

    ApiResponse<ReceptionistResponse> createReceptionist(
            CreateReceptionistRequest request
    );

    ApiResponse<ReceptionistResponse> getReceptionistById(
            Long receptionistId
    );

    ApiResponse<PageResponse<ReceptionistResponse>>
    getAllReceptionists(
            int page,
            int size,
            String sortBy,
            String sortDir
    );

    ApiResponse<ReceptionistResponse> updateReceptionist(
            Long receptionistId,
            UpdateReceptionistRequest request
    );

    ApiResponse<Void> deleteReceptionist(
            Long receptionistId
    );

    ApiResponse<ReceptionistResponse> activateReceptionist(
            Long receptionistId
    );

    ApiResponse<ReceptionistResponse> deactivateReceptionist(
            Long receptionistId
    );
    
    ApiResponse<PatientResponse> registerPatient(
            CreatePatientRequest request
    );
    
    ApiResponse<AppointmentResponse> checkInPatient(
            Long appointmentId
    );
    
    ApiResponse<PageResponse<AppointmentResponse>> getTodayAppointments(
            int page,
            int size,
            String sortBy,
            String sortDir
    );
    
    ApiResponse<PageResponse<PatientResponse>> searchPatients(
            String keyword,
            int page,
            int size
    );

}