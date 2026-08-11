package com.medcore.features.appointment.service;

import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.PageResponse;
import com.medcore.features.appointment.dto.request.CreateAppointmentRequest;
import com.medcore.features.appointment.dto.request.UpdateAppointmentStatusRequest;
import com.medcore.features.appointment.dto.response.AppointmentResponse;

public interface AppointmentService {

    ApiResponse<AppointmentResponse> createAppointment(
            CreateAppointmentRequest request
    );
    
    ApiResponse<PageResponse<AppointmentResponse>> getAllAppointments(
            int page,
            int size,
            String sortBy,
            String sortDir
    );

    ApiResponse<AppointmentResponse> getAppointmentById(
            Long appointmentId
    );
    
    ApiResponse<PageResponse<AppointmentResponse>> getDoctorAppointments(
            Long doctorId,
            int page,
            int size
    );

    ApiResponse<PageResponse<AppointmentResponse>> getPatientAppointments(
            Long patientId,
            int page,
            int size
    );
    
    ApiResponse<AppointmentResponse> updateAppointmentStatus(
            Long appointmentId,
            UpdateAppointmentStatusRequest request
    );

    ApiResponse<String> cancelAppointment(Long appointmentId);
    
    ApiResponse<String> deleteAppointment(Long appointmentId);

    ApiResponse<String> restoreAppointment(Long appointmentId);
    
    ApiResponse<AppointmentResponse> checkInAppointment(
            Long appointmentId
    );
    
    ApiResponse<PageResponse<AppointmentResponse>> getTodayAppointments(
            int page,
            int size,
            String sortBy,
            String sortDir
    );
}