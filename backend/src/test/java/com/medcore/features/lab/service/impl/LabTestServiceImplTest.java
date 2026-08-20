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
import com.medcore.features.user.entity.User;
import com.medcore.features.user.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LabTestServiceImplTest {

    @Mock
    private LabTestRepository labTestRepository;

    @Mock
    private LabTestMapper labTestMapper;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private LabTestServiceImpl labTestService;

    private User currentUser;
    private LabTest labTest;
    private LabTestResponse response;

    private MockedStatic<SecurityUtil> securityUtil;

    @BeforeEach
    void setUp() {

        currentUser = mock(User.class);

        labTest = mock(LabTest.class);

        response = LabTestResponse.builder()
                .id(10L)
                .name("CBC")
                .status(LabTestStatus.ACTIVE)
                .build();

        securityUtil = mockStatic(SecurityUtil.class);

        securityUtil
                .when(SecurityUtil::getCurrentUsername)
                .thenReturn("doctor@medcore.com");

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.of(currentUser));
    }

    @AfterEach
    void tearDown() {
        securityUtil.close();
    }

    // ---------------------------------------------------------
    // CREATE
    // ---------------------------------------------------------

    @Test
    void createLabTest_shouldCreateSuccessfully() {

        CreateLabTestRequest request =
                new CreateLabTestRequest();

        request.setName(" CBC ");

        when(labTestRepository
                .existsByNameIgnoreCaseAndDeletedAtIsNull("CBC"))
                .thenReturn(false);

        when(labTestMapper.toEntity(request))
                .thenReturn(labTest);

        when(labTestRepository.save(labTest))
                .thenReturn(labTest);

        when(labTestMapper.toResponse(labTest))
                .thenReturn(response);

        ApiResponse<LabTestResponse> result =
                labTestService.createLabTest(request);

        assertTrue(result.isSuccess());

        assertEquals(
                "Lab test created successfully",
                result.getMessage()
        );

        assertEquals(
                response,
                result.getData()
        );

        verify(labTest).setStatus(
                LabTestStatus.ACTIVE
        );

        verify(labTestRepository)
                .save(labTest);
    }

    @Test
    void createLabTest_shouldRejectDuplicateName() {

        CreateLabTestRequest request =
                new CreateLabTestRequest();

        request.setName("CBC");

        when(labTestRepository
                .existsByNameIgnoreCaseAndDeletedAtIsNull("CBC"))
                .thenReturn(true);

        assertThrows(
                BusinessException.class,
                () -> labTestService.createLabTest(request)
        );

        verify(labTestRepository, never())
                .save(any());

        verifyNoInteractions(labTestMapper);
    }

    @Test
    void createLabTest_shouldThrowWhenCurrentUserNotFound() {

        CreateLabTestRequest request =
                new CreateLabTestRequest();

        request.setName("CBC");

        when(userRepository.findByEmail("doctor@medcore.com"))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> labTestService.createLabTest(request)
        );

        verifyNoInteractions(labTestRepository);
        verifyNoInteractions(labTestMapper);
    }

    // ---------------------------------------------------------
    // GET BY ID
    // ---------------------------------------------------------

    @Test
    void getLabTestById_shouldReturnLabTest() {

        when(labTestRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(labTest));

        when(labTestMapper.toResponse(labTest))
                .thenReturn(response);

        ApiResponse<LabTestResponse> result =
                labTestService.getLabTestById(10L);

        assertTrue(result.isSuccess());

        assertEquals(
                "Lab test fetched successfully",
                result.getMessage()
        );

        assertEquals(
                response,
                result.getData()
        );
    }

    @Test
    void getLabTestById_shouldThrowWhenNotFound() {

        when(labTestRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> labTestService.getLabTestById(10L)
        );

        verifyNoInteractions(labTestMapper);
    }

    // ---------------------------------------------------------
    // GET ALL
    // ---------------------------------------------------------

    @Test
    void getAllLabTests_shouldReturnOnlyActiveRecords() {

        LabTest activeTest =
                mock(LabTest.class);

        LabTest deletedTest =
                mock(LabTest.class);

        LabTestResponse activeResponse =
                LabTestResponse.builder()
                        .id(10L)
                        .name("CBC")
                        .status(LabTestStatus.ACTIVE)
                        .build();

        when(activeTest.getDeletedAt())
                .thenReturn(null);

        when(deletedTest.getDeletedAt())
                .thenReturn(LocalDateTime.now());

        when(labTestRepository.findAll())
                .thenReturn(
                        List.of(
                                activeTest,
                                deletedTest
                        )
                );

        when(labTestMapper.toResponse(activeTest))
                .thenReturn(activeResponse);

        ApiResponse<List<LabTestResponse>> result =
                labTestService.getAllLabTests();

        assertTrue(result.isSuccess());

        assertEquals(
                "Lab tests fetched successfully",
                result.getMessage()
        );

        assertEquals(
                1,
                result.getData().size()
        );

        assertEquals(
                activeResponse,
                result.getData().get(0)
        );

        verify(labTestMapper)
                .toResponse(activeTest);

        verify(labTestMapper, never())
                .toResponse(deletedTest);
    }

    // ---------------------------------------------------------
    // UPDATE
    // ---------------------------------------------------------

    @Test
    void updateLabTest_shouldUpdateSuccessfully() {

        UpdateLabTestRequest request =
                new UpdateLabTestRequest();

        request.setName("Lipid Profile");

        when(labTestRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(labTest));

        when(labTest.getName())
                .thenReturn("CBC");

        when(labTestRepository
                .existsByNameIgnoreCaseAndDeletedAtIsNull(
                        "Lipid Profile"
                ))
                .thenReturn(false);

        when(labTestRepository.save(labTest))
                .thenReturn(labTest);

        when(labTestMapper.toResponse(labTest))
                .thenReturn(response);

        ApiResponse<LabTestResponse> result =
                labTestService.updateLabTest(
                        10L,
                        request
                );

        assertTrue(result.isSuccess());

        assertEquals(
                "Lab test updated successfully",
                result.getMessage()
        );

        assertEquals(
                response,
                result.getData()
        );

        verify(labTestMapper)
                .updateEntity(
                        labTest,
                        request
                );

        verify(labTestRepository)
                .save(labTest);
    }

    @Test
    void updateLabTest_shouldRejectDuplicateName() {

        UpdateLabTestRequest request =
                new UpdateLabTestRequest();

        request.setName("Lipid Profile");

        when(labTestRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(labTest));

        when(labTest.getName())
                .thenReturn("CBC");

        when(labTestRepository
                .existsByNameIgnoreCaseAndDeletedAtIsNull(
                        "Lipid Profile"
                ))
                .thenReturn(true);

        assertThrows(
                BusinessException.class,
                () -> labTestService.updateLabTest(
                        10L,
                        request
                )
        );

        verify(labTestRepository, never())
                .save(any());

        verify(labTestMapper, never())
                .updateEntity(
                        any(),
                        any()
                );
    }

    @Test
    void updateLabTest_shouldNotCheckDuplicateWhenNameUnchanged() {

        UpdateLabTestRequest request =
                new UpdateLabTestRequest();

        request.setName("CBC");

        when(labTestRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(labTest));

        when(labTest.getName())
                .thenReturn("CBC");

        when(labTestRepository.save(labTest))
                .thenReturn(labTest);

        when(labTestMapper.toResponse(labTest))
                .thenReturn(response);

        ApiResponse<LabTestResponse> result =
                labTestService.updateLabTest(
                        10L,
                        request
                );

        assertTrue(result.isSuccess());

        verify(labTestRepository, never())
                .existsByNameIgnoreCaseAndDeletedAtIsNull(
                        anyString()
                );

        verify(labTestMapper)
                .updateEntity(
                        labTest,
                        request
                );

        verify(labTestRepository)
                .save(labTest);
    }

    @Test
    void updateLabTest_shouldThrowWhenNotFound() {

        UpdateLabTestRequest request =
                new UpdateLabTestRequest();

        request.setName("CBC");

        when(labTestRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> labTestService.updateLabTest(
                        10L,
                        request
                )
        );

        verify(labTestRepository, never())
                .save(any());
    }

    // ---------------------------------------------------------
    // DELETE
    // ---------------------------------------------------------

    @Test
    void deleteLabTest_shouldSoftDelete() {

        when(labTestRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(labTest));

        labTestService.deleteLabTest(10L);

        verify(labTest)
                .setDeletedAt(any(LocalDateTime.class));

        verify(labTestRepository)
                .save(labTest);
    }

    @Test
    void deleteLabTest_shouldThrowWhenNotFound() {

        when(labTestRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> labTestService.deleteLabTest(10L)
        );

        verify(labTestRepository, never())
                .save(any());
    }

    // ---------------------------------------------------------
    // ACTIVATE
    // ---------------------------------------------------------

    @Test
    void activateLabTest_shouldActivateSuccessfully() {

        when(labTestRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(labTest));

        when(labTest.getStatus())
                .thenReturn(LabTestStatus.INACTIVE);

        when(labTestRepository.save(labTest))
                .thenReturn(labTest);

        when(labTestMapper.toResponse(labTest))
                .thenReturn(response);

        ApiResponse<LabTestResponse> result =
                labTestService.activateLabTest(10L);

        assertTrue(result.isSuccess());

        assertEquals(
                "Lab test activated successfully",
                result.getMessage()
        );

        verify(labTest)
                .setStatus(LabTestStatus.ACTIVE);

        verify(labTestRepository)
                .save(labTest);
    }

    @Test
    void activateLabTest_shouldRejectAlreadyActive() {

        when(labTestRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(labTest));

        when(labTest.getStatus())
                .thenReturn(LabTestStatus.ACTIVE);

        assertThrows(
                BusinessException.class,
                () -> labTestService.activateLabTest(10L)
        );

        verify(labTestRepository, never())
                .save(any());
    }

    // ---------------------------------------------------------
    // DEACTIVATE
    // ---------------------------------------------------------

    @Test
    void deactivateLabTest_shouldDeactivateSuccessfully() {

        when(labTestRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(labTest));

        when(labTest.getStatus())
                .thenReturn(LabTestStatus.ACTIVE);

        when(labTestRepository.save(labTest))
                .thenReturn(labTest);

        when(labTestMapper.toResponse(labTest))
                .thenReturn(response);

        ApiResponse<LabTestResponse> result =
                labTestService.deactivateLabTest(10L);

        assertTrue(result.isSuccess());

        assertEquals(
                "Lab test deactivated successfully",
                result.getMessage()
        );

        verify(labTest)
                .setStatus(LabTestStatus.INACTIVE);

        verify(labTestRepository)
                .save(labTest);
    }

    @Test
    void deactivateLabTest_shouldRejectAlreadyInactive() {

        when(labTestRepository
                .findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(labTest));

        when(labTest.getStatus())
                .thenReturn(LabTestStatus.INACTIVE);

        assertThrows(
                BusinessException.class,
                () -> labTestService.deactivateLabTest(10L)
        );

        verify(labTestRepository, never())
                .save(any());
    }
}