package com.medcore.features.appointment.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.security.TenantContextService;
import com.medcore.features.appointment.dto.request.CreateAppointmentRequest;
import com.medcore.features.appointment.entity.Appointment;
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
import com.medcore.features.user.entity.Role;
import com.medcore.features.user.entity.User;
import com.medcore.features.user.enums.RoleName;
import com.medcore.features.user.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
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

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AppointmentServiceImpl appointmentService;

    private Hospital hospital;
    private Hospital anotherHospital;

    private Doctor doctor;
    private Patient patient;
    private DoctorSchedule schedule;

    private CreateAppointmentRequest request;


    @BeforeEach
    void setUp() {

        // =====================================================
        // HOSPITAL
        // =====================================================

        hospital = new Hospital();
        hospital.setId(1L);

        anotherHospital = new Hospital();
        anotherHospital.setId(2L);


        // =====================================================
        // DOCTOR
        // =====================================================

        doctor = new Doctor();

        doctor.setId(10L);

        doctor.setHospital(hospital);

        doctor.setStatus(
                DoctorStatus.ACTIVE
        );

        /*
         * AppointmentServiceImpl calculates:
         *
         * endTime = startTime + consultationDurationMinutes
         */
        doctor.setConsultationDurationMinutes(30);


        // =====================================================
        // PATIENT
        // =====================================================

        patient = new Patient();

        patient.setId(20L);

        patient.setStatus(
                PatientStatus.ACTIVE
        );


        // =====================================================
        // DOCTOR SCHEDULE
        // =====================================================

        schedule = new DoctorSchedule();

        schedule.setStartTime(
                LocalTime.of(9, 0)
        );

        schedule.setEndTime(
                LocalTime.of(17, 0)
        );

        schedule.setAvailable(true);


        // =====================================================
        // APPOINTMENT REQUEST
        // =====================================================

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
    }


    @AfterEach
    void tearDown() {

        SecurityContextHolder.clearContext();
    }


    // =========================================================
    // HELPER
    // =========================================================

   private void mockReceptionistAuthentication() {

    Role receptionistRole = new Role();
    receptionistRole.setName(RoleName.RECEPTIONIST);

    User receptionistUser = new User();
    receptionistUser.setId(100L);
    receptionistUser.setEmail("receptionist@test.com");
    receptionistUser.setRole(receptionistRole);

    when(
            userRepository.findByEmailWithRole(
                    "receptionist@test.com"
            )
    ).thenReturn(
            Optional.of(receptionistUser)
    );

    SecurityContextHolder.getContext()
            .setAuthentication(
                    new UsernamePasswordAuthenticationToken(
                            "receptionist@test.com",
                            null,
                            List.of()
                    )
            );
}


    // =========================================================
    // TEST 1
    // Invalid / unavailable time
    // =========================================================

    @Test
    void createAppointment_shouldRejectInvalidTimeRange() {

        mockReceptionistAuthentication();

        request.setStartTime(
                LocalTime.of(18, 0)
        );

        when(
                tenantContextService.getCurrentHospitalId()
        ).thenReturn(1L);

        when(
                patientRepository.findByIdAndDeletedAtIsNull(20L)
        ).thenReturn(
                Optional.of(patient)
        );

        when(
                hospitalRepository.findByIdAndDeletedAtIsNull(1L)
        ).thenReturn(
                Optional.of(hospital)
        );

        when(
                doctorRepository.findByIdAndDeletedAtIsNull(10L)
        ).thenReturn(
                Optional.of(doctor)
        );

        when(
                doctorScheduleRepository
                        .findByDoctorIdAndDayOfWeekAndDeletedAtIsNull(
                                eq(10L),
                                any(DayOfWeek.class)
                        )
        ).thenReturn(
                List.of(schedule)
        );

        assertThrows(
                BusinessException.class,
                () -> appointmentService.createAppointment(request)
        );

        verifyNoInteractions(
                appointmentRepository
        );
    }


    // =========================================================
    // TEST 2
    // Receptionist uses current hospital
    // =========================================================

    @Test
    void createAppointment_shouldUseCurrentHospitalForReceptionist() {

        mockReceptionistAuthentication();

        when(
                tenantContextService.getCurrentHospitalId()
        ).thenReturn(2L);

        when(
                patientRepository.findByIdAndDeletedAtIsNull(20L)
        ).thenReturn(
                Optional.of(patient)
        );

        when(
                hospitalRepository.findByIdAndDeletedAtIsNull(2L)
        ).thenReturn(
                Optional.of(anotherHospital)
        );

        when(
                doctorRepository.findByIdAndDeletedAtIsNull(10L)
        ).thenReturn(
                Optional.of(doctor)
        );

        assertThrows(
                BusinessException.class,
                () -> appointmentService.createAppointment(request)
        );

        verify(
                hospitalRepository
        ).findByIdAndDeletedAtIsNull(2L);

        verifyNoInteractions(
                doctorScheduleRepository,
                appointmentRepository
        );
    }


    // =========================================================
    // TEST 3
    // Hospital not found
    // =========================================================

    @Test
    void createAppointment_shouldThrowWhenHospitalNotFound() {

        mockReceptionistAuthentication();

        when(
                tenantContextService.getCurrentHospitalId()
        ).thenReturn(1L);

        /*
         * Receptionist flow loads patient first.
         */
        when(
                patientRepository.findByIdAndDeletedAtIsNull(20L)
        ).thenReturn(
                Optional.of(patient)
        );

        when(
                hospitalRepository.findByIdAndDeletedAtIsNull(1L)
        ).thenReturn(
                Optional.empty()
        );

        assertThrows(
                ResourceNotFoundException.class,
                () -> appointmentService.createAppointment(request)
        );

        verify(
                hospitalRepository
        ).findByIdAndDeletedAtIsNull(1L);

        verifyNoInteractions(
                doctorRepository,
                doctorScheduleRepository,
                appointmentRepository
        );
    }


    // =========================================================
    // TEST 4
    // Doctor not found
    // =========================================================

    @Test
    void createAppointment_shouldThrowWhenDoctorNotFound() {

        mockReceptionistAuthentication();

        when(
                tenantContextService.getCurrentHospitalId()
        ).thenReturn(1L);

        when(
                patientRepository.findByIdAndDeletedAtIsNull(20L)
        ).thenReturn(
                Optional.of(patient)
        );

        when(
                hospitalRepository.findByIdAndDeletedAtIsNull(1L)
        ).thenReturn(
                Optional.of(hospital)
        );

        when(
                doctorRepository.findByIdAndDeletedAtIsNull(10L)
        ).thenReturn(
                Optional.empty()
        );

        assertThrows(
                ResourceNotFoundException.class,
                () -> appointmentService.createAppointment(request)
        );

        verify(
                doctorRepository
        ).findByIdAndDeletedAtIsNull(10L);

        verifyNoInteractions(
                doctorScheduleRepository,
                appointmentRepository
        );
    }


    // =========================================================
    // TEST 5
    // Patient not found
    // =========================================================

    @Test
    void createAppointment_shouldThrowWhenPatientNotFound() {

        mockReceptionistAuthentication();

        when(
                tenantContextService.getCurrentHospitalId()
        ).thenReturn(1L);

        when(
                patientRepository.findByIdAndDeletedAtIsNull(20L)
        ).thenReturn(
                Optional.empty()
        );

        assertThrows(
                ResourceNotFoundException.class,
                () -> appointmentService.createAppointment(request)
        );

        verify(
                patientRepository
        ).findByIdAndDeletedAtIsNull(20L);

        verifyNoInteractions(
                hospitalRepository,
                doctorRepository,
                doctorScheduleRepository,
                appointmentRepository
        );
    }


    // =========================================================
    // TEST 6
    // Doctor belongs to another hospital
    // =========================================================

    @Test
    void createAppointment_shouldRejectDoctorFromAnotherHospital() {

        mockReceptionistAuthentication();

        doctor.setHospital(
                anotherHospital
        );

        when(
                tenantContextService.getCurrentHospitalId()
        ).thenReturn(1L);

        when(
                patientRepository.findByIdAndDeletedAtIsNull(20L)
        ).thenReturn(
                Optional.of(patient)
        );

        when(
                hospitalRepository.findByIdAndDeletedAtIsNull(1L)
        ).thenReturn(
                Optional.of(hospital)
        );

        when(
                doctorRepository.findByIdAndDeletedAtIsNull(10L)
        ).thenReturn(
                Optional.of(doctor)
        );

        assertThrows(
                BusinessException.class,
                () -> appointmentService.createAppointment(request)
        );

        verifyNoInteractions(
                doctorScheduleRepository,
                appointmentRepository
        );
    }


    // =========================================================
    // TEST 7
    // Patient is global
    //
    // There is intentionally no:
    //
    // createAppointment_shouldRejectPatientFromAnotherHospital
    //
    // because Patient no longer belongs to a hospital.
    // =========================================================


    // =========================================================
    // TEST 8
    // Inactive doctor
    // =========================================================

    @Test
    void createAppointment_shouldRejectInactiveDoctor() {

        mockReceptionistAuthentication();

        doctor.setStatus(
                DoctorStatus.INACTIVE
        );

        when(
                tenantContextService.getCurrentHospitalId()
        ).thenReturn(1L);

        when(
                patientRepository.findByIdAndDeletedAtIsNull(20L)
        ).thenReturn(
                Optional.of(patient)
        );

        when(
                hospitalRepository.findByIdAndDeletedAtIsNull(1L)
        ).thenReturn(
                Optional.of(hospital)
        );

        when(
                doctorRepository.findByIdAndDeletedAtIsNull(10L)
        ).thenReturn(
                Optional.of(doctor)
        );

        assertThrows(
                BusinessException.class,
                () -> appointmentService.createAppointment(request)
        );

        verifyNoInteractions(
                doctorScheduleRepository,
                appointmentRepository
        );
    }


    // =========================================================
    // TEST 9
    // Inactive patient
    // =========================================================

    @Test
    void createAppointment_shouldRejectInactivePatient() {

        mockReceptionistAuthentication();

        patient.setStatus(
                PatientStatus.INACTIVE
        );

        when(
                tenantContextService.getCurrentHospitalId()
        ).thenReturn(1L);

        when(
                patientRepository.findByIdAndDeletedAtIsNull(20L)
        ).thenReturn(
                Optional.of(patient)
        );

        when(
                hospitalRepository.findByIdAndDeletedAtIsNull(1L)
        ).thenReturn(
                Optional.of(hospital)
        );

        when(
                doctorRepository.findByIdAndDeletedAtIsNull(10L)
        ).thenReturn(
                Optional.of(doctor)
        );

        assertThrows(
                BusinessException.class,
                () -> appointmentService.createAppointment(request)
        );

        verifyNoInteractions(
                doctorScheduleRepository,
                appointmentRepository
        );
    }


    // =========================================================
    // TEST 10
    // Past appointment date
    // =========================================================

    @Test
    void createAppointment_shouldRejectPastDate() {

        mockReceptionistAuthentication();

        request.setAppointmentDate(
                LocalDate.now().minusDays(1)
        );

        when(
                tenantContextService.getCurrentHospitalId()
        ).thenReturn(1L);

        when(
                patientRepository.findByIdAndDeletedAtIsNull(20L)
        ).thenReturn(
                Optional.of(patient)
        );

        when(
                hospitalRepository.findByIdAndDeletedAtIsNull(1L)
        ).thenReturn(
                Optional.of(hospital)
        );

        when(
                doctorRepository.findByIdAndDeletedAtIsNull(10L)
        ).thenReturn(
                Optional.of(doctor)
        );

        assertThrows(
                BusinessException.class,
                () -> appointmentService.createAppointment(request)
        );

        verifyNoInteractions(
                doctorScheduleRepository,
                appointmentRepository
        );
    }


    // =========================================================
    // TEST 11
    // Doctor unavailable
    // =========================================================

    @Test
    void createAppointment_shouldRejectWhenDoctorUnavailable() {

        mockReceptionistAuthentication();

        when(
                tenantContextService.getCurrentHospitalId()
        ).thenReturn(1L);

        when(
                patientRepository.findByIdAndDeletedAtIsNull(20L)
        ).thenReturn(
                Optional.of(patient)
        );

        when(
                hospitalRepository.findByIdAndDeletedAtIsNull(1L)
        ).thenReturn(
                Optional.of(hospital)
        );

        when(
                doctorRepository.findByIdAndDeletedAtIsNull(10L)
        ).thenReturn(
                Optional.of(doctor)
        );

        when(
                doctorScheduleRepository
                        .findByDoctorIdAndDayOfWeekAndDeletedAtIsNull(
                                eq(10L),
                                any(DayOfWeek.class)
                        )
        ).thenReturn(
                List.of()
        );

        assertThrows(
                BusinessException.class,
                () -> appointmentService.createAppointment(request)
        );

        verifyNoInteractions(
                appointmentRepository
        );
    }


    // =========================================================
    // TEST 12
    // Overlapping appointment
    // =========================================================

    @Test
    void createAppointment_shouldRejectOverlappingAppointment() {

        mockReceptionistAuthentication();

        when(
                tenantContextService.getCurrentHospitalId()
        ).thenReturn(1L);

        when(
                patientRepository.findByIdAndDeletedAtIsNull(20L)
        ).thenReturn(
                Optional.of(patient)
        );

        when(
                hospitalRepository.findByIdAndDeletedAtIsNull(1L)
        ).thenReturn(
                Optional.of(hospital)
        );

        when(
                doctorRepository.findByIdAndDeletedAtIsNull(10L)
        ).thenReturn(
                Optional.of(doctor)
        );

        when(
                doctorScheduleRepository
                        .findByDoctorIdAndDayOfWeekAndDeletedAtIsNull(
                                eq(10L),
                                any(DayOfWeek.class)
                        )
        ).thenReturn(
                List.of(schedule)
        );

        LocalTime expectedEndTime =
                request.getStartTime()
                        .plusMinutes(
                                doctor.getConsultationDurationMinutes()
                        );

        when(
                appointmentRepository.existsOverlappingAppointment(
                        10L,
                        request.getAppointmentDate(),
                        request.getStartTime(),
                        expectedEndTime
                )
        ).thenReturn(true);

        assertThrows(
                BusinessException.class,
                () -> appointmentService.createAppointment(request)
        );

        verify(
                appointmentRepository
        ).existsOverlappingAppointment(
                10L,
                request.getAppointmentDate(),
                request.getStartTime(),
                expectedEndTime
        );
    }
}