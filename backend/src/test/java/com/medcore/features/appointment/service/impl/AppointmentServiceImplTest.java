package com.medcore.features.appointment.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.security.TenantContextService;
import com.medcore.features.appointment.dto.request.CreateAppointmentRequest;
import com.medcore.features.appointment.mapper.AppointmentMapper;
import com.medcore.features.appointment.repository.AppointmentRepository;
import com.medcore.features.doctor.entity.Doctor;
import com.medcore.features.doctor.entity.DoctorSchedule;
import com.medcore.features.doctor.enums.DayOfWeek;
import com.medcore.features.doctor.enums.DoctorStatus;
import com.medcore.features.doctor.repository.DoctorRepository;
import com.medcore.features.doctor.repository.DoctorScheduleRepository;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.repository.HospitalRepository;
import com.medcore.features.patient.entity.Patient;
import com.medcore.features.patient.enums.PatientStatus;
import com.medcore.features.patient.repository.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceImplTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private HospitalRepository hospitalRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private DoctorScheduleRepository doctorScheduleRepository;

    @Mock
    private AppointmentMapper appointmentMapper;

    @Mock
    private TenantContextService tenantContextService;

    @InjectMocks
    private AppointmentServiceImpl appointmentService;


    private Hospital hospital;
    private Doctor doctor;
    private Patient patient;
    private CreateAppointmentRequest request;


    @BeforeEach
    void setUp() {

        hospital = new Hospital();
        hospital.setId(1L);

        doctor = new Doctor();
        doctor.setId(10L);
        doctor.setHospital(hospital);
        doctor.setStatus(DoctorStatus.ACTIVE);

        patient = new Patient();
        patient.setId(20L);
        patient.setHospital(hospital);
        patient.setStatus(PatientStatus.ACTIVE);

        request = new CreateAppointmentRequest();

        request.setHospitalId(1L);
        request.setDoctorId(10L);
        request.setPatientId(20L);
        request.setAppointmentDate(
                LocalDate.now().plusDays(1)
        );
        request.setStartTime(
                LocalTime.of(10, 0)
        );
        request.setEndTime(
                LocalTime.of(10, 30)
        );
    }


   
    // TEST 1
    // Start time must be before end time
    

    @Test
    void createAppointment_shouldRejectInvalidTimeRange() {

        request.setStartTime(
                LocalTime.of(11, 0)
        );

        request.setEndTime(
                LocalTime.of(10, 0)
        );

        assertThrows(
                BusinessException.class,
                () -> appointmentService.createAppointment(request)
        );

        verifyNoInteractions(
                hospitalRepository,
                doctorRepository,
                patientRepository,
                appointmentRepository
        );
    }


   
    // TEST 2
    // Hospital tenant isolation
    

    @Test
    void createAppointment_shouldRejectDifferentHospital() {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(2L);

        assertThrows(
                BusinessException.class,
                () -> appointmentService.createAppointment(request)
        );

        verifyNoInteractions(
                hospitalRepository,
                doctorRepository,
                patientRepository,
                appointmentRepository
        );
    }


   
    // TEST 3
    // Hospital not found
    

    @Test
    void createAppointment_shouldThrowWhenHospitalNotFound() {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(hospitalRepository.findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> appointmentService.createAppointment(request)
        );

        verify(
                hospitalRepository
        ).findByIdAndDeletedAtIsNull(1L);

        verifyNoInteractions(
                doctorRepository,
                patientRepository,
                appointmentRepository
        );
    }


    
    // TEST 4
    // Doctor not found
    

    @Test
    void createAppointment_shouldThrowWhenDoctorNotFound() {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(hospitalRepository.findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(hospital));

        when(doctorRepository.findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> appointmentService.createAppointment(request)
        );
    }


   
    // TEST 5
    // Patient not found
    

    @Test
    void createAppointment_shouldThrowWhenPatientNotFound() {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(hospitalRepository.findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(hospital));

        when(doctorRepository.findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(doctor));

        when(patientRepository.findByIdAndDeletedAtIsNull(20L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> appointmentService.createAppointment(request)
        );
    }


   
    // TEST 6
    // Doctor must belong to hospital
    

    @Test
    void createAppointment_shouldRejectDoctorFromAnotherHospital() {

        Hospital anotherHospital = new Hospital();
        anotherHospital.setId(2L);

        doctor.setHospital(anotherHospital);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(hospitalRepository.findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(hospital));

        when(doctorRepository.findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(doctor));

        when(patientRepository.findByIdAndDeletedAtIsNull(20L))
                .thenReturn(Optional.of(patient));

        assertThrows(
                BusinessException.class,
                () -> appointmentService.createAppointment(request)
        );
    }


   
    // TEST 7
    // Patient must belong to hospital
   
    @Test
    void createAppointment_shouldRejectPatientFromAnotherHospital() {

        Hospital anotherHospital = new Hospital();
        anotherHospital.setId(2L);

        patient.setHospital(anotherHospital);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(hospitalRepository.findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(hospital));

        when(doctorRepository.findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(doctor));

        when(patientRepository.findByIdAndDeletedAtIsNull(20L))
                .thenReturn(Optional.of(patient));

        assertThrows(
                BusinessException.class,
                () -> appointmentService.createAppointment(request)
        );
    }


     
    // TEST 8
    // Inactive doctor
   

    @Test
    void createAppointment_shouldRejectInactiveDoctor() {

        doctor.setStatus(DoctorStatus.INACTIVE);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(hospitalRepository.findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(hospital));

        when(doctorRepository.findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(doctor));

        when(patientRepository.findByIdAndDeletedAtIsNull(20L))
                .thenReturn(Optional.of(patient));

        assertThrows(
                BusinessException.class,
                () -> appointmentService.createAppointment(request)
        );
    }


    
    // TEST 9
    // Inactive patient
   
    @Test
    void createAppointment_shouldRejectInactivePatient() {

        patient.setStatus(PatientStatus.INACTIVE);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(hospitalRepository.findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(hospital));

        when(doctorRepository.findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(doctor));

        when(patientRepository.findByIdAndDeletedAtIsNull(20L))
                .thenReturn(Optional.of(patient));

        assertThrows(
                BusinessException.class,
                () -> appointmentService.createAppointment(request)
        );
    }


    
    // TEST 10
    // Past appointment date
    

    @Test
    void createAppointment_shouldRejectPastDate() {

        request.setAppointmentDate(
                LocalDate.now().minusDays(1)
        );

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(hospitalRepository.findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(hospital));

        when(doctorRepository.findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(doctor));

        when(patientRepository.findByIdAndDeletedAtIsNull(20L))
                .thenReturn(Optional.of(patient));

        assertThrows(
                BusinessException.class,
                () -> appointmentService.createAppointment(request)
        );
    }


    
    // TEST 11
    // Doctor unavailable during requested time
    

    @Test
    void createAppointment_shouldRejectWhenDoctorUnavailable() {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(hospitalRepository.findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(hospital));

        when(doctorRepository.findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(doctor));

        when(patientRepository.findByIdAndDeletedAtIsNull(20L))
                .thenReturn(Optional.of(patient));

        when(
                doctorScheduleRepository
                        .findByDoctorIdAndDayOfWeekAndDeletedAtIsNull(
                                eq(10L),
                                any(DayOfWeek.class)
                        )
        ).thenReturn(List.of());

        assertThrows(
                BusinessException.class,
                () -> appointmentService.createAppointment(request)
        );

        verifyNoInteractions(appointmentRepository);
    }


     
    // TEST 12
    // Overlapping appointment
    
    @Test
    void createAppointment_shouldRejectOverlappingAppointment() {

        DoctorSchedule schedule = new DoctorSchedule();

        schedule.setStartTime(
                LocalTime.of(9, 0)
        );

        schedule.setEndTime(
                LocalTime.of(17, 0)
        );

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(hospitalRepository.findByIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(hospital));

        when(doctorRepository.findByIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(doctor));

        when(patientRepository.findByIdAndDeletedAtIsNull(20L))
                .thenReturn(Optional.of(patient));

        when(
                doctorScheduleRepository
                        .findByDoctorIdAndDayOfWeekAndDeletedAtIsNull(
                                eq(10L),
                                any(DayOfWeek.class)
                        )
        ).thenReturn(List.of(schedule));

        when(
                appointmentRepository.existsOverlappingAppointment(
                        eq(10L),
                        eq(request.getAppointmentDate()),
                        eq(request.getStartTime()),
                        eq(request.getEndTime())
                )
        ).thenReturn(true);

        assertThrows(
                BusinessException.class,
                () -> appointmentService.createAppointment(request)
        );

        verify(appointmentRepository)
                .existsOverlappingAppointment(
                        10L,
                        request.getAppointmentDate(),
                        request.getStartTime(),
                        request.getEndTime()
                );
    }
}