package com.medcore.features.nurse.service;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.nurse.dto.request.CreateNurseRequest;
import com.medcore.features.nurse.dto.request.UpdateNurseRequest;
import com.medcore.features.nurse.dto.response.NurseResponse;

import java.util.List;
import com.medcore.features.nurse.dto.request.UpdateMyNurseProfileRequest;
import com.medcore.features.nurse.dto.response.NurseProfileResponse;
import org.springframework.web.multipart.MultipartFile;

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
    
    ApiResponse<NurseProfileResponse> getMyProfile();

    ApiResponse<NurseProfileResponse> updateMyProfile(
            UpdateMyNurseProfileRequest request
    );

    ApiResponse<NurseProfileResponse> uploadMyProfileImage(
            MultipartFile file
    );
}