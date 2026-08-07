package com.medcore.features.doctor.service;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.doctor.dto.request.CreateDoctorScheduleRequest;
import com.medcore.features.doctor.dto.response.DoctorScheduleResponse;

import java.util.List;

public interface DoctorScheduleService {

    ApiResponse<DoctorScheduleResponse> createSchedule(
            CreateDoctorScheduleRequest request
    );

    ApiResponse<List<DoctorScheduleResponse>> getDoctorSchedules(
            Long doctorId
    );

}