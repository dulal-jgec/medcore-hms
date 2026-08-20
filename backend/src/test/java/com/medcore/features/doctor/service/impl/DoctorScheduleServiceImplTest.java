package com.medcore.features.doctor.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.security.TenantContextService;
import com.medcore.features.doctor.dto.request.CreateDoctorScheduleRequest;
import com.medcore.features.doctor.dto.response.DoctorScheduleResponse;
import com.medcore.features.doctor.entity.Doctor;
import com.medcore.features.doctor.entity.DoctorSchedule;
import com.medcore.features.doctor.enums.DayOfWeek;
import com.medcore.features.doctor.enums.DoctorStatus;
import com.medcore.features.doctor.mapper.DoctorScheduleMapper;
import com.medcore.features.doctor.repository.DoctorRepository;
import com.medcore.features.doctor.repository.DoctorScheduleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DoctorScheduleServiceImplTest {

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private DoctorScheduleRepository scheduleRepository;

    @Mock
    private DoctorScheduleMapper scheduleMapper;

    @Mock
    private TenantContextService tenantContextService;

    @InjectMocks
    private DoctorScheduleServiceImpl scheduleService;

    private Doctor doctor;

    private DoctorSchedule schedule;

    private DoctorScheduleResponse response;

@BeforeEach
void setUp() {

    doctor = Doctor.builder()
            .status(DoctorStatus.ACTIVE)
            .build();

    doctor.setId(50L);

    schedule = mock(DoctorSchedule.class);

    response = DoctorScheduleResponse.builder()
            .id(100L)
            .doctorId(50L)
            .doctorName("Dr. John")
            .dayOfWeek(DayOfWeek.MONDAY)
            .startTime(LocalTime.of(9, 0))
            .endTime(LocalTime.of(13, 0))
            .available(true)
            .build();
}

    // ---------------------------------------------------------
    // CREATE
    // ---------------------------------------------------------

    @Test
    void createSchedule_shouldCreateSuccessfully() {

        CreateDoctorScheduleRequest request =
                new CreateDoctorScheduleRequest();

        request.setDoctorId(50L);
        request.setDayOfWeek(DayOfWeek.MONDAY);
        request.setStartTime(LocalTime.of(9, 0));
        request.setEndTime(LocalTime.of(13, 0));

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(doctorRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(
                        50L,
                        1L
                ))
                .thenReturn(Optional.of(doctor));

        when(scheduleRepository
                .findByDoctorIdAndDayOfWeekAndDeletedAtIsNull(
                        50L,
                        DayOfWeek.MONDAY
                ))
                .thenReturn(List.of());

        when(scheduleMapper.toEntity(
                request,
                doctor
        ))
                .thenReturn(schedule);

        when(scheduleRepository.save(schedule))
                .thenReturn(schedule);

        when(scheduleMapper.toResponse(schedule))
                .thenReturn(response);

        ApiResponse<DoctorScheduleResponse> result =
                scheduleService.createSchedule(request);

        assertTrue(result.isSuccess());

        assertEquals(
                "Doctor schedule created successfully",
                result.getMessage()
        );

        assertEquals(
                response,
                result.getData()
        );

        verify(scheduleRepository)
                .save(schedule);
    }

    @Test
    void createSchedule_shouldThrowWhenDoctorNotFound() {

        CreateDoctorScheduleRequest request =
                new CreateDoctorScheduleRequest();

        request.setDoctorId(50L);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(doctorRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(
                        50L,
                        1L
                ))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> scheduleService.createSchedule(request)
        );

        verifyNoInteractions(scheduleRepository);
        verifyNoInteractions(scheduleMapper);
    }

    @Test
    void createSchedule_shouldRejectInactiveDoctor() {

        CreateDoctorScheduleRequest request =
                new CreateDoctorScheduleRequest();

        request.setDoctorId(50L);

        doctor.setStatus(DoctorStatus.INACTIVE);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(doctorRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(
                        50L,
                        1L
                ))
                .thenReturn(Optional.of(doctor));

        assertThrows(
                BusinessException.class,
                () -> scheduleService.createSchedule(request)
        );

        verifyNoInteractions(scheduleRepository);
        verifyNoInteractions(scheduleMapper);
    }

    @Test
    void createSchedule_shouldRejectInvalidTime() {

        CreateDoctorScheduleRequest request =
                new CreateDoctorScheduleRequest();

        request.setDoctorId(50L);
        request.setDayOfWeek(DayOfWeek.MONDAY);
        request.setStartTime(LocalTime.of(13, 0));
        request.setEndTime(LocalTime.of(9, 0));

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(doctorRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(
                        50L,
                        1L
                ))
                .thenReturn(Optional.of(doctor));

        assertThrows(
                BusinessException.class,
                () -> scheduleService.createSchedule(request)
        );

        verify(scheduleRepository, never())
                .save(any());

        verify(
                scheduleRepository,
                never()
        ).findByDoctorIdAndDayOfWeekAndDeletedAtIsNull(
                any(),
                any()
        );
    }

    @Test
    void createSchedule_shouldRejectOverlappingSchedule() {

        CreateDoctorScheduleRequest request =
                new CreateDoctorScheduleRequest();

        request.setDoctorId(50L);
        request.setDayOfWeek(DayOfWeek.MONDAY);
        request.setStartTime(LocalTime.of(11, 0));
        request.setEndTime(LocalTime.of(14, 0));

        DoctorSchedule existingSchedule =
                mock(DoctorSchedule.class);

        when(existingSchedule.getStartTime())
                .thenReturn(LocalTime.of(9, 0));

        when(existingSchedule.getEndTime())
                .thenReturn(LocalTime.of(13, 0));

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(doctorRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(
                        50L,
                        1L
                ))
                .thenReturn(Optional.of(doctor));

        when(scheduleRepository
                .findByDoctorIdAndDayOfWeekAndDeletedAtIsNull(
                        50L,
                        DayOfWeek.MONDAY
                ))
                .thenReturn(List.of(existingSchedule));

        assertThrows(
                BusinessException.class,
                () -> scheduleService.createSchedule(request)
        );

        verify(scheduleRepository, never())
                .save(any());

        verifyNoInteractions(scheduleMapper);
    }

@Test
void createSchedule_shouldAllowNonOverlappingSchedule() {

    CreateDoctorScheduleRequest request =
            new CreateDoctorScheduleRequest();

    request.setDoctorId(50L);
    request.setDayOfWeek(DayOfWeek.MONDAY);
    request.setStartTime(LocalTime.of(13, 0));
    request.setEndTime(LocalTime.of(17, 0));

    DoctorSchedule existingSchedule =
            mock(DoctorSchedule.class);

    when(existingSchedule.getEndTime())
            .thenReturn(LocalTime.of(13, 0));

    when(tenantContextService.getCurrentHospitalId())
            .thenReturn(1L);

    when(doctorRepository
            .findByIdAndHospitalIdAndDeletedAtIsNull(
                    50L,
                    1L
            ))
            .thenReturn(Optional.of(doctor));

    when(scheduleRepository
            .findByDoctorIdAndDayOfWeekAndDeletedAtIsNull(
                    50L,
                    DayOfWeek.MONDAY
            ))
            .thenReturn(List.of(existingSchedule));

    when(scheduleMapper.toEntity(
            request,
            doctor
    ))
            .thenReturn(schedule);

    when(scheduleRepository.save(schedule))
            .thenReturn(schedule);

    when(scheduleMapper.toResponse(schedule))
            .thenReturn(response);

    ApiResponse<DoctorScheduleResponse> result =
            scheduleService.createSchedule(request);

    assertTrue(result.isSuccess());

    assertEquals(
            "Doctor schedule created successfully",
            result.getMessage()
    );

    assertEquals(
            response,
            result.getData()
    );

    verify(scheduleRepository)
            .save(schedule);
}

    @Test
    void createSchedule_shouldWorkForSuperAdmin() {

        CreateDoctorScheduleRequest request =
                new CreateDoctorScheduleRequest();

        request.setDoctorId(50L);
        request.setDayOfWeek(DayOfWeek.MONDAY);
        request.setStartTime(LocalTime.of(9, 0));
        request.setEndTime(LocalTime.of(13, 0));

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(null);

        when(doctorRepository
                .findByIdAndDeletedAtIsNull(50L))
                .thenReturn(Optional.of(doctor));

        when(scheduleRepository
                .findByDoctorIdAndDayOfWeekAndDeletedAtIsNull(
                        50L,
                        DayOfWeek.MONDAY
                ))
                .thenReturn(List.of());

        when(scheduleMapper.toEntity(
                request,
                doctor
        ))
                .thenReturn(schedule);

        when(scheduleRepository.save(schedule))
                .thenReturn(schedule);

        when(scheduleMapper.toResponse(schedule))
                .thenReturn(response);

        ApiResponse<DoctorScheduleResponse> result =
                scheduleService.createSchedule(request);

        assertTrue(result.isSuccess());

        assertEquals(
                response,
                result.getData()
        );

        verify(doctorRepository)
                .findByIdAndDeletedAtIsNull(50L);

        verify(scheduleRepository)
                .save(schedule);
    }

    // ---------------------------------------------------------
    // GET SCHEDULES
    // ---------------------------------------------------------

    @Test
    void getDoctorSchedules_shouldReturnSchedules() {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(doctorRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(
                        50L,
                        1L
                ))
                .thenReturn(Optional.of(doctor));

        when(scheduleRepository
                .findByDoctorIdAndDeletedAtIsNull(50L))
                .thenReturn(List.of(schedule));

        when(scheduleMapper.toResponse(schedule))
                .thenReturn(response);

        ApiResponse<List<DoctorScheduleResponse>> result =
                scheduleService.getDoctorSchedules(50L);

        assertTrue(result.isSuccess());

        assertEquals(
                1,
                result.getData().size()
        );

        assertEquals(
                response,
                result.getData().get(0)
        );
    }

    @Test
    void getDoctorSchedules_shouldThrowWhenDoctorNotFound() {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(doctorRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(
                        50L,
                        1L
                ))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> scheduleService.getDoctorSchedules(50L)
        );

        verifyNoInteractions(scheduleRepository);
        verifyNoInteractions(scheduleMapper);
    }

    @Test
    void getDoctorSchedules_shouldWorkForSuperAdmin() {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(null);

        when(doctorRepository
                .findByIdAndDeletedAtIsNull(50L))
                .thenReturn(Optional.of(doctor));

        when(scheduleRepository
                .findByDoctorIdAndDeletedAtIsNull(50L))
                .thenReturn(List.of());

        ApiResponse<List<DoctorScheduleResponse>> result =
                scheduleService.getDoctorSchedules(50L);

        assertTrue(result.isSuccess());

        assertTrue(
                result.getData().isEmpty()
        );

        verify(doctorRepository)
                .findByIdAndDeletedAtIsNull(50L);

        verify(scheduleRepository)
                .findByDoctorIdAndDeletedAtIsNull(50L);
    }
}