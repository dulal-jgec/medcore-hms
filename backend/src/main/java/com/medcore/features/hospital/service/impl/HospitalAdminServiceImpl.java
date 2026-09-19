package com.medcore.features.hospital.service.impl;

import com.medcore.common.response.ApiResponse;
import com.medcore.common.security.TenantContextService;
import com.medcore.features.hospital.dto.request.UpdateHospitalProfileRequest;
import com.medcore.features.hospital.dto.response.HospitalProfileResponse;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.mapper.HospitalMapper;
import com.medcore.features.hospital.repository.HospitalRepository;
import com.medcore.features.hospital.service.HospitalAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.medcore.common.storage.FileStorageService;
import com.medcore.common.storage.FileValidationService;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Transactional
public class HospitalAdminServiceImpl implements HospitalAdminService {

    private final HospitalRepository hospitalRepository;
    private final HospitalMapper hospitalMapper;
    private final TenantContextService tenantContextService;
    private final FileStorageService fileStorageService;
    private final FileValidationService fileValidationService;
    
    @Override
    @Transactional(readOnly = true)
    public ApiResponse<HospitalProfileResponse> getMyHospitalProfile() {

        Hospital hospital =
                tenantContextService.getCurrentHospital();

        HospitalProfileResponse response =
                hospitalMapper.toProfileResponse(hospital);

        return ApiResponse
                .<HospitalProfileResponse>builder()
                .success(true)
                .message("Hospital profile fetched successfully")
                .data(response)
                .build();
    }

    @Override
    public ApiResponse<HospitalProfileResponse> updateMyHospitalProfile(
            UpdateHospitalProfileRequest request) {

        Hospital hospital =
                tenantContextService.getCurrentHospital();

        hospital.setState(request.getState());
        hospital.setAddress(request.getAddress());
        hospital.setPincode(request.getPincode());
        hospital.setEmergencyPhone(request.getEmergencyPhone());
        hospital.setDescription(request.getDescription());

        Hospital updatedHospital =
                hospitalRepository.save(hospital);

        HospitalProfileResponse response =
                hospitalMapper.toProfileResponse(updatedHospital);

        return ApiResponse
                .<HospitalProfileResponse>builder()
                .success(true)
                .message("Hospital profile updated successfully")
                .data(response)
                .build();
    }
    
    @Override
    public ApiResponse<HospitalProfileResponse> uploadLogo(
            MultipartFile file) {

        Hospital hospital =
                tenantContextService.getCurrentHospital();

        fileValidationService.validateImage(file);

        String logoUrl =
                fileStorageService.upload(
                        file,
                        "medcore/hospitals/"
                                + hospital.getId()
                                + "/logo"
                );

        hospital.setLogoUrl(logoUrl);

        Hospital updatedHospital =
                hospitalRepository.save(hospital);

        HospitalProfileResponse response =
                hospitalMapper.toProfileResponse(updatedHospital);

        return ApiResponse
                .<HospitalProfileResponse>builder()
                .success(true)
                .message("Hospital logo uploaded successfully")
                .data(response)
                .build();
    }
    
    @Override
    public ApiResponse<HospitalProfileResponse> uploadBanner(
            MultipartFile file) {

        Hospital hospital =
                tenantContextService.getCurrentHospital();

        fileValidationService.validateImage(file);

        String bannerUrl =
                fileStorageService.upload(
                        file,
                        "medcore/hospitals/"
                                + hospital.getId()
                                + "/banner"
                );

        hospital.setBannerUrl(bannerUrl);

        Hospital updatedHospital =
                hospitalRepository.save(hospital);

        HospitalProfileResponse response =
                hospitalMapper.toProfileResponse(updatedHospital);

        return ApiResponse
                .<HospitalProfileResponse>builder()
                .success(true)
                .message("Hospital banner uploaded successfully")
                .data(response)
                .build();
    }
}