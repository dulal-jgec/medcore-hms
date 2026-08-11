package com.medcore.features.lab.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.security.SecurityUtil;
import com.medcore.features.lab.dto.request.CreateLabTestRequest;
import com.medcore.features.lab.dto.request.UpdateLabTestRequest;
import com.medcore.features.lab.dto.response.LabTestResponse;
import com.medcore.features.lab.entity.LabTest;
import com.medcore.features.lab.enums.LabTestStatus;
import com.medcore.features.lab.mapper.LabTestMapper;
import com.medcore.features.lab.repository.LabTestRepository;
import com.medcore.features.lab.service.LabTestService;
import com.medcore.features.user.entity.User;
import com.medcore.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LabTestServiceImpl implements LabTestService {

    private final LabTestRepository labTestRepository;
    private final LabTestMapper labTestMapper;
    private final UserRepository userRepository;

     
    @Override
    public ApiResponse<LabTestResponse> createLabTest(
            CreateLabTestRequest request) {

        getCurrentUser();

        if (labTestRepository
                .existsByNameIgnoreCaseAndDeletedAtIsNull(
                        request.getName().trim())) {

            throw new BusinessException(
                    "Lab test already exists"
            );
        }

        LabTest labTest =
                labTestMapper.toEntity(request);

        labTest.setStatus(
                LabTestStatus.ACTIVE
        );

        LabTest savedLabTest =
                labTestRepository.save(labTest);

        return ApiResponse.<LabTestResponse>builder()
                .success(true)
                .message("Lab test created successfully")
                .data(
                        labTestMapper.toResponse(
                                savedLabTest
                        )
                )
                .build();
    }

     

    @Override
    public ApiResponse<LabTestResponse> getLabTestById(
            Long labTestId) {

        getCurrentUser();

        LabTest labTest =
                getLabTest(labTestId);

        return ApiResponse.<LabTestResponse>builder()
                .success(true)
                .message("Lab test fetched successfully")
                .data(
                        labTestMapper.toResponse(
                                labTest
                        )
                )
                .build();
    }

    
    @Override
    public ApiResponse<List<LabTestResponse>> getAllLabTests() {

        getCurrentUser();

        List<LabTestResponse> tests =
                labTestRepository
                        .findAll()
                        .stream()
                        .filter(test ->
                                test.getDeletedAt() == null
                        )
                        .map(labTestMapper::toResponse)
                        .toList();

        return ApiResponse.<List<LabTestResponse>>builder()
                .success(true)
                .message("Lab tests fetched successfully")
                .data(tests)
                .build();
    }

    
    @Override
    public ApiResponse<LabTestResponse> updateLabTest(
            Long labTestId,
            UpdateLabTestRequest request) {

        getCurrentUser();

        LabTest labTest =
                getLabTest(labTestId);

        boolean nameChanged =
                !labTest.getName()
                        .equalsIgnoreCase(
                                request.getName().trim()
                        );

        if (nameChanged
                && labTestRepository
                        .existsByNameIgnoreCaseAndDeletedAtIsNull(
                                request.getName().trim()
                        )) {

            throw new BusinessException(
                    "Lab test with this name already exists"
            );
        }

        labTestMapper.updateEntity(
                labTest,
                request
        );

        LabTest updatedLabTest =
                labTestRepository.save(labTest);

        return ApiResponse.<LabTestResponse>builder()
                .success(true)
                .message("Lab test updated successfully")
                .data(
                        labTestMapper.toResponse(
                                updatedLabTest
                        )
                )
                .build();
    }

     
    @Override
    public ApiResponse<Void> deleteLabTest(
            Long labTestId) {

        getCurrentUser();

        LabTest labTest =
                getLabTest(labTestId);

        labTest.setDeletedAt(
                LocalDateTime.now()
        );

        labTestRepository.save(labTest);

        return ApiResponse.<Void>builder()
                .success(true)
                .message("Lab test deleted successfully")
                .data(null)
                .build();
    }

   
    @Override
    public ApiResponse<LabTestResponse> activateLabTest(
            Long labTestId) {

        getCurrentUser();

        LabTest labTest =
                getLabTest(labTestId);

        labTest.setStatus(
                LabTestStatus.ACTIVE
        );

        LabTest savedLabTest =
                labTestRepository.save(labTest);

        return ApiResponse.<LabTestResponse>builder()
                .success(true)
                .message("Lab test activated successfully")
                .data(
                        labTestMapper.toResponse(
                                savedLabTest
                        )
                )
                .build();
    }

     
    @Override
    public ApiResponse<LabTestResponse> deactivateLabTest(
            Long labTestId) {

        getCurrentUser();

        LabTest labTest =
                getLabTest(labTestId);

        labTest.setStatus(
                LabTestStatus.INACTIVE
        );

        LabTest savedLabTest =
                labTestRepository.save(labTest);

        return ApiResponse.<LabTestResponse>builder()
                .success(true)
                .message("Lab test deactivated successfully")
                .data(
                        labTestMapper.toResponse(
                                savedLabTest
                        )
                )
                .build();
    }

    // ---------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------

    private LabTest getLabTest(Long labTestId) {

        return labTestRepository
                .findByIdAndDeletedAtIsNull(labTestId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Lab test not found"
                        ));
    }

    private User getCurrentUser() {

        String email =
                SecurityUtil.getCurrentUsername();

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Current user not found"
                        ));
    }
}