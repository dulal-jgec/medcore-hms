package com.medcore.features.nurse.service;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.nurse.dto.request.CreateNurseRequest;
import com.medcore.features.nurse.dto.request.UpdateNurseRequest;
import com.medcore.features.nurse.dto.response.NurseResponse;

import java.util.List;

public interface NurseService {

    ApiResponse<NurseResponse> createNurse(
            CreateNurseRequest request
    );

    ApiResponse<NurseResponse> getNurseById(
            Long nurseId
    );

    ApiResponse<List<NurseResponse>> getAllNurses();

    ApiResponse<NurseResponse> updateNurse(
            Long nurseId,
            UpdateNurseRequest request
    );

    ApiResponse<Void> deleteNurse(
            Long nurseId
    );

    ApiResponse<NurseResponse> activateNurse(
            Long nurseId
    );

    ApiResponse<NurseResponse> deactivateNurse(
            Long nurseId
    );
}