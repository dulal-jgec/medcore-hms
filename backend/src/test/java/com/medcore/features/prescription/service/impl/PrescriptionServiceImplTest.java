package com.medcore.features.prescription.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.security.TenantContextService;

import com.medcore.features.appointment.entity.Appointment;
import com.medcore.features.appointment.enums.AppointmentStatus;
import com.medcore.features.appointment.repository.AppointmentRepository;

import com.medcore.features.doctor.entity.Doctor;
import com.medcore.features.doctor.repository.DoctorRepository;

import com.medcore.features.hospital.entity.Hospital;

import com.medcore.features.patient.entity.Patient;
import com.medcore.features.patient.repository.PatientRepository;

import com.medcore.features.prescription.dto.request.AddPrescriptionItemRequest;
import com.medcore.features.prescription.dto.request.CreatePrescriptionRequest;
import com.medcore.features.prescription.dto.response.PrescriptionItemResponse;
import com.medcore.features.prescription.dto.response.PrescriptionResponse;

import com.medcore.features.prescription.entity.Medicine;
import com.medcore.features.prescription.entity.Prescription;
import com.medcore.features.prescription.entity.PrescriptionItem;

import com.medcore.features.prescription.enums.PrescriptionStatus;

import com.medcore.features.prescription.mapper.PrescriptionItemMapper;
import com.medcore.features.prescription.mapper.PrescriptionMapper;

import com.medcore.features.prescription.repository.MedicineRepository;
import com.medcore.features.prescription.repository.PrescriptionItemRepository;
import com.medcore.features.prescription.repository.PrescriptionRepository;

import com.medcore.features.prescription.service.PrescriptionPdfService;

import com.medcore.features.user.entity.User;
import com.medcore.features.user.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.junit.jupiter.api.AfterEach;

@ExtendWith(MockitoExtension.class)
class PrescriptionServiceImplTest {

    @Mock
    private PrescriptionRepository prescriptionRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PrescriptionMapper prescriptionMapper;

    @Mock
    private PrescriptionItemMapper prescriptionItemMapper;

    @Mock
    private MedicineRepository medicineRepository;

    @Mock
    private PrescriptionItemRepository prescriptionItemRepository;

    @Mock
    private PrescriptionPdfService prescriptionPdfService;

    @Mock
    private TenantContextService tenantContextService;

    @InjectMocks
    private PrescriptionServiceImpl prescriptionService;

    private User doctorUser;
    private User patientUser;

    private Doctor doctor;
    private Patient patient;
    private Hospital hospital;

    private Appointment appointment;
    private Prescription prescription;
    private PrescriptionItem item;
    private Medicine medicine;

   @BeforeEach
   void setUp() {

    hospital = new Hospital();
    hospital.setId(100L);

    doctorUser = new User();
    doctorUser.setId(10L);
    doctorUser.setFullName("Dr. John");
    doctorUser.setEmail("doctor@test.com");

    patientUser = new User();
    patientUser.setId(20L);
    patientUser.setFullName("Patient One");
    patientUser.setEmail("patient@test.com");

    doctor = new Doctor();
    doctor.setId(1L);
    doctor.setUser(doctorUser);
    doctor.setHospital(hospital);

    patient = new Patient();
    patient.setId(2L);
    patient.setUser(patientUser);
    patient.setHospital(hospital);

    appointment = new Appointment();
    appointment.setId(50L);
    appointment.setDoctor(doctor);
    appointment.setPatient(patient);
    appointment.setHospital(hospital);
    appointment.setStatus(AppointmentStatus.COMPLETED);

    prescription = new Prescription();
    prescription.setId(1000L);
    prescription.setAppointment(appointment);
    prescription.setDoctor(doctor);
    prescription.setPatient(patient);
    prescription.setHospital(hospital);
    prescription.setStatus(PrescriptionStatus.DRAFT);
    prescription.setSharedWithPatient(false);

    item = new PrescriptionItem();
    item.setId(500L);
    item.setPrescription(prescription);
    item.setMedicineName("Paracetamol");
    item.setDosage("1 tablet");
    item.setQuantity(10);
    item.setFrequency("Twice daily");
    item.setDuration("5 days");

    medicine = new Medicine();
    medicine.setId(100L);
    medicine.setName("Paracetamol");
    medicine.setStrength("500mg");
    medicine.setDosageForm("Tablet");
    medicine.setActive(true);

    
}
   		
   @AfterEach
   void tearDown() {

       SecurityContextHolder.clearContext();
   }
     
    @Test
    void createPrescription_shouldCreateSuccessfully() {

        mockCurrentDoctor();

        CreatePrescriptionRequest request =
                new CreatePrescriptionRequest();

        request.setAppointmentId(50L);

        when(appointmentRepository
                .findByIdAndDeletedAtIsNull(50L))
                .thenReturn(Optional.of(appointment));

        when(prescriptionRepository
                .existsByAppointmentIdAndDeletedAtIsNull(50L))
                .thenReturn(false);

        when(prescriptionMapper.toEntity(
                request,
                appointment,
                doctor,
                patient,
                hospital
        )).thenReturn(prescription);

        when(prescriptionRepository.save(prescription))
                .thenReturn(prescription);

        PrescriptionResponse response =
                PrescriptionResponse.builder()
                        .id(1000L)
                        .appointmentId(50L)
                        .build();

        when(prescriptionMapper.toResponse(
                prescription,
                List.of()
        )).thenReturn(response);

        ApiResponse<PrescriptionResponse> result =
                prescriptionService.createPrescription(request);

        assertTrue(result.isSuccess());
        assertNotNull(result.getData());
        assertEquals(1000L, result.getData().getId());

        verify(prescriptionRepository)
                .save(prescription);
    }

    @Test
    void createPrescription_shouldThrowWhenAppointmentNotFound() {

        authenticate(doctorUser);

        when(userRepository
                .findByEmail(doctorUser.getEmail()))
                .thenReturn(Optional.of(doctorUser));

        when(doctorRepository
                .findByUserIdAndDeletedAtIsNull(doctorUser.getId()))
                .thenReturn(Optional.of(doctor));

        CreatePrescriptionRequest request =
                new CreatePrescriptionRequest();

        request.setAppointmentId(50L);

        when(appointmentRepository
                .findByIdAndDeletedAtIsNull(50L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> prescriptionService
                        .createPrescription(request)
        );

        verify(prescriptionRepository, never())
                .save(any());
    }
    		
    		
    @Test
    void createPrescription_shouldRejectWrongHospital() {

        mockCurrentDoctor();

        Hospital anotherHospital = new Hospital();
        anotherHospital.setId(200L);

        appointment.setHospital(anotherHospital);

        CreatePrescriptionRequest request =
                new CreatePrescriptionRequest();

        request.setAppointmentId(50L);

        when(appointmentRepository
                .findByIdAndDeletedAtIsNull(50L))
                .thenReturn(Optional.of(appointment));

        assertThrows(
                BusinessException.class,
                () -> prescriptionService
                        .createPrescription(request)
        );

        verify(prescriptionRepository, never())
                .save(any());
    }

    @Test
    void createPrescription_shouldRejectDoctorWhoDoesNotOwnAppointment() {

        mockCurrentDoctor();

        Doctor anotherDoctor = new Doctor();
        anotherDoctor.setId(999L);

        appointment.setDoctor(anotherDoctor);

        CreatePrescriptionRequest request =
                new CreatePrescriptionRequest();

        request.setAppointmentId(50L);

        when(appointmentRepository
                .findByIdAndDeletedAtIsNull(50L))
                .thenReturn(Optional.of(appointment));

        assertThrows(
                BusinessException.class,
                () -> prescriptionService
                        .createPrescription(request)
        );

        verify(prescriptionRepository, never())
                .save(any());
    }

    @Test
    void createPrescription_shouldRejectIncompleteAppointment() {

        mockCurrentDoctor();

        appointment.setStatus(AppointmentStatus.SCHEDULED);

        CreatePrescriptionRequest request =
                new CreatePrescriptionRequest();

        request.setAppointmentId(50L);

        when(appointmentRepository
                .findByIdAndDeletedAtIsNull(50L))
                .thenReturn(Optional.of(appointment));

        assertThrows(
                BusinessException.class,
                () -> prescriptionService
                        .createPrescription(request)
        );

        verify(prescriptionRepository, never())
                .save(any());
    }

    @Test
    void createPrescription_shouldRejectDuplicatePrescription() {

        mockCurrentDoctor();

        CreatePrescriptionRequest request =
                new CreatePrescriptionRequest();

        request.setAppointmentId(50L);

        when(appointmentRepository
                .findByIdAndDeletedAtIsNull(50L))
                .thenReturn(Optional.of(appointment));

        when(prescriptionRepository
                .existsByAppointmentIdAndDeletedAtIsNull(50L))
                .thenReturn(true);

        assertThrows(
                BusinessException.class,
                () -> prescriptionService
                        .createPrescription(request)
        );

        verify(prescriptionRepository, never())
                .save(any());
    }

     

    @Test
    void addMedicine_shouldAddExistingMedicineSuccessfully() {

        mockCurrentDoctor();
        mockPrescription();

        AddPrescriptionItemRequest request =
                new AddPrescriptionItemRequest();

        request.setMedicineId(100L);
        request.setDosage("1 tablet");
        request.setQuantity(10);
        request.setFrequency("Twice daily");
        request.setDuration("5 days");

        when(medicineRepository
                .findByIdAndDeletedAtIsNull(100L))
                .thenReturn(Optional.of(medicine));

        when(prescriptionItemRepository.save(any()))
                .thenReturn(item);

        PrescriptionItemResponse response =
                PrescriptionItemResponse.builder()
                        .id(500L)
                        .medicineName("Paracetamol")
                        .build();

        when(prescriptionItemMapper.toResponse(item))
                .thenReturn(response);

        ApiResponse<PrescriptionItemResponse> result =
                prescriptionService.addMedicine(
                        1000L,
                        request
                );

        assertTrue(result.isSuccess());
        assertEquals(
                "Paracetamol",
                result.getData().getMedicineName()
        );

        verify(prescriptionItemRepository)
                .save(any(PrescriptionItem.class));
    }

    @Test
    void addMedicine_shouldAddManualMedicineSuccessfully() {

        mockCurrentDoctor();
        mockPrescription();

        AddPrescriptionItemRequest request =
                new AddPrescriptionItemRequest();

        request.setMedicineName("Special Medicine");
        request.setStrength("250mg");
        request.setDosage("1 tablet");
        request.setQuantity(5);
        request.setFrequency("Once daily");
        request.setDuration("5 days");

        when(prescriptionItemRepository.save(any()))
                .thenReturn(item);

        when(prescriptionItemMapper.toResponse(item))
                .thenReturn(
                        PrescriptionItemResponse.builder()
                                .id(500L)
                                .medicineName("Special Medicine")
                                .build()
                );

        ApiResponse<PrescriptionItemResponse> result =
                prescriptionService.addMedicine(
                        1000L,
                        request
                );

        assertTrue(result.isSuccess());

        verify(medicineRepository, never())
                .findByIdAndDeletedAtIsNull(anyLong());

        verify(prescriptionItemRepository)
                .save(any(PrescriptionItem.class));
    }

    @Test
    void addMedicine_shouldRejectBothMedicineIdAndName() {

        mockCurrentDoctor();
        mockPrescription();

        AddPrescriptionItemRequest request =
                new AddPrescriptionItemRequest();

        request.setMedicineId(100L);
        request.setMedicineName("Paracetamol");
        request.setDosage("1 tablet");
        request.setQuantity(10);
        request.setFrequency("Once daily");
        request.setDuration("5 days");

        assertThrows(
                BusinessException.class,
                () -> prescriptionService
                        .addMedicine(1000L, request)
        );

        verify(prescriptionItemRepository, never())
                .save(any());
    }

    @Test
    void addMedicine_shouldRejectInactiveMedicine() {

        mockCurrentDoctor();
        mockPrescription();

        medicine.setActive(false);

        AddPrescriptionItemRequest request =
                new AddPrescriptionItemRequest();

        request.setMedicineId(100L);
        request.setDosage("1 tablet");
        request.setQuantity(10);
        request.setFrequency("Once daily");
        request.setDuration("5 days");

        when(medicineRepository
                .findByIdAndDeletedAtIsNull(100L))
                .thenReturn(Optional.of(medicine));

        assertThrows(
                BusinessException.class,
                () -> prescriptionService
                        .addMedicine(1000L, request)
        );

        verify(prescriptionItemRepository, never())
                .save(any());
    }

    @Test
    void addMedicine_shouldRejectFinalizedPrescription() {

        mockCurrentDoctor();
        mockPrescription();

        prescription.setStatus(
                PrescriptionStatus.FINALIZED
        );

        AddPrescriptionItemRequest request =
                validManualMedicineRequest();

        assertThrows(
                BusinessException.class,
                () -> prescriptionService
                        .addMedicine(1000L, request)
        );

        verify(prescriptionItemRepository, never())
                .save(any());
    }

    

    @Test
    void finalizePrescription_shouldFinalizeSuccessfully() {

        mockCurrentDoctor();
        mockPrescription();

        when(prescriptionItemRepository
                .existsByPrescriptionIdAndDeletedAtIsNull(1000L))
                .thenReturn(true);

        when(prescriptionRepository.save(prescription))
                .thenReturn(prescription);

        when(prescriptionItemRepository
                .findByPrescriptionIdAndDeletedAtIsNull(1000L))
                .thenReturn(List.of(item));

        when(prescriptionItemMapper.toResponse(item))
                .thenReturn(
                        PrescriptionItemResponse.builder()
                                .id(500L)
                                .build()
                );

        when(prescriptionMapper.toResponse(
                eq(prescription),
                anyList()
        )).thenReturn(
                PrescriptionResponse.builder()
                        .id(1000L)
                        .status(PrescriptionStatus.FINALIZED)
                        .build()
        );

        ApiResponse<PrescriptionResponse> result =
                prescriptionService
                        .finalizePrescription(1000L);

        assertTrue(result.isSuccess());
        assertEquals(
                PrescriptionStatus.FINALIZED,
                prescription.getStatus()
        );

        verify(prescriptionRepository)
                .save(prescription);
    }

    @Test
    void finalizePrescription_shouldRejectEmptyPrescription() {

        mockCurrentDoctor();
        mockPrescription();

        when(prescriptionItemRepository
                .existsByPrescriptionIdAndDeletedAtIsNull(1000L))
                .thenReturn(false);

        assertThrows(
                BusinessException.class,
                () -> prescriptionService
                        .finalizePrescription(1000L)
        );

        verify(prescriptionRepository, never())
                .save(any());
    }

    @Test
    void finalizePrescription_shouldRejectAlreadyFinalized() {

        mockCurrentDoctor();
        mockPrescription();

        prescription.setStatus(
                PrescriptionStatus.FINALIZED
        );

        assertThrows(
                BusinessException.class,
                () -> prescriptionService
                        .finalizePrescription(1000L)
        );

        verify(prescriptionRepository, never())
                .save(any());
    }

    

    @Test
    void sharePrescription_shouldShareSuccessfully() {

        mockCurrentDoctor();
        mockPrescription();

        prescription.setStatus(
                PrescriptionStatus.FINALIZED
        );

        when(prescriptionRepository.save(prescription))
                .thenReturn(prescription);

        when(prescriptionItemRepository
                .findByPrescriptionIdAndDeletedAtIsNull(1000L))
                .thenReturn(List.of(item));

        when(prescriptionItemMapper.toResponse(item))
                .thenReturn(
                        PrescriptionItemResponse.builder()
                                .id(500L)
                                .build()
                );

        when(prescriptionMapper.toResponse(
                eq(prescription),
                anyList()
        )).thenReturn(
                PrescriptionResponse.builder()
                        .id(1000L)
                        .build()
        );

        ApiResponse<PrescriptionResponse> result =
                prescriptionService
                        .sharePrescriptionWithPatient(1000L);

        assertTrue(result.isSuccess());
        assertTrue(
                prescription.getSharedWithPatient()
        );

        verify(prescriptionRepository)
                .save(prescription);
    }

    @Test
    void sharePrescription_shouldRejectDraft() {

        mockCurrentDoctor();
        mockPrescription();

        assertThrows(
                BusinessException.class,
                () -> prescriptionService
                        .sharePrescriptionWithPatient(1000L)
        );

        verify(prescriptionRepository, never())
                .save(any());
    }

    

    @Test
    void getPatientPrescription_shouldAllowCorrectPatient() {

        mockCurrentUser(patientUser);

        when(patientRepository
                .findByUserIdAndHospitalIdAndDeletedAtIsNull(
                        20L,
                        100L
                ))
                .thenReturn(Optional.of(patient));

        mockPrescription();

        prescription.setStatus(
                PrescriptionStatus.FINALIZED
        );
        prescription.setSharedWithPatient(true);

        when(prescriptionItemRepository
                .findByPrescriptionIdAndDeletedAtIsNull(1000L))
                .thenReturn(List.of(item));

        when(prescriptionItemMapper.toResponse(item))
                .thenReturn(
                        PrescriptionItemResponse.builder()
                                .id(500L)
                                .build()
                );

        when(prescriptionMapper.toResponse(
                eq(prescription),
                anyList()
        )).thenReturn(
                PrescriptionResponse.builder()
                        .id(1000L)
                        .build()
        );

        ApiResponse<PrescriptionResponse> result =
                prescriptionService
                        .getPatientPrescription(1000L);

        assertTrue(result.isSuccess());
        assertNotNull(result.getData());
    }

    @Test
    void getPatientPrescription_shouldRejectWrongPatient() {

    	User anotherUser = new User();
    	anotherUser.setId(99L);
    	anotherUser.setEmail("another@test.com");

        Patient anotherPatient = new Patient();
        anotherPatient.setId(999L);
        anotherPatient.setUser(anotherUser);
        anotherPatient.setHospital(hospital);

        mockCurrentUser(anotherUser);

        when(patientRepository
                .findByUserIdAndHospitalIdAndDeletedAtIsNull(
                        99L,
                        100L
                ))
                .thenReturn(Optional.of(anotherPatient));

        mockPrescription();

        prescription.setStatus(
                PrescriptionStatus.FINALIZED
        );
        prescription.setSharedWithPatient(true);

        assertThrows(
                BusinessException.class,
                () -> prescriptionService
                        .getPatientPrescription(1000L)
        );

        verify(prescriptionItemRepository, never())
                .findByPrescriptionIdAndDeletedAtIsNull(anyLong());
    }

    @Test
    void getPatientPrescription_shouldRejectUnsharedPrescription() {

        mockCurrentUser(patientUser);

        when(patientRepository
                .findByUserIdAndHospitalIdAndDeletedAtIsNull(
                        20L,
                        100L
                ))
                .thenReturn(Optional.of(patient));

        mockPrescription();

        prescription.setStatus(
                PrescriptionStatus.FINALIZED
        );
        prescription.setSharedWithPatient(false);

        assertThrows(
                BusinessException.class,
                () -> prescriptionService
                        .getPatientPrescription(1000L)
        );
    }

     

    @Test
    void deleteMedicine_shouldSoftDeleteSuccessfully() {

        mockCurrentDoctor();
        mockPrescription();

        when(prescriptionItemRepository
                .findByIdAndPrescriptionIdAndDeletedAtIsNull(
                        500L,
                        1000L
                ))
                .thenReturn(Optional.of(item));

        ApiResponse<Void> result =
                prescriptionService
                        .deleteMedicine(
                                1000L,
                                500L
                        );

        assertTrue(result.isSuccess());
        assertNotNull(item.getDeletedAt());

        verify(prescriptionItemRepository)
                .save(item);
    }

     
    @Test
    void downloadPrescriptionPdf_shouldGeneratePdfSuccessfully() {

        mockCurrentUser(patientUser);

        when(patientRepository
                .findByUserIdAndHospitalIdAndDeletedAtIsNull(
                        20L,
                        100L
                ))
                .thenReturn(Optional.of(patient));

        mockPrescription();

        prescription.setStatus(
                PrescriptionStatus.FINALIZED
        );

        prescription.setSharedWithPatient(true);

        byte[] pdf =
                "test-pdf".getBytes();

        when(prescriptionItemRepository
                .findByPrescriptionIdAndDeletedAtIsNull(1000L))
                .thenReturn(List.of(item));

        when(prescriptionPdfService
                .generatePrescriptionPdf(
                        prescription,
                        List.of(item)
                ))
                .thenReturn(pdf);

        ResponseEntity<byte[]> result =
                prescriptionService
                        .downloadPrescriptionPdf(1000L);

        assertEquals(
                200,
                result.getStatusCode().value()
        );

        assertArrayEquals(
                pdf,
                result.getBody()
        );

        assertEquals(
                "application/pdf",
                result.getHeaders()
                        .getContentType()
                        .toString()
        );
    }

    @Test
    void downloadPrescriptionPdf_shouldRejectUnsharedPrescription() {

        mockCurrentUser(patientUser);

        when(patientRepository
                .findByUserIdAndHospitalIdAndDeletedAtIsNull(
                        20L,
                        100L
                ))
                .thenReturn(Optional.of(patient));

        mockPrescription();

        prescription.setStatus(
                PrescriptionStatus.FINALIZED
        );

        prescription.setSharedWithPatient(false);

        assertThrows(
                BusinessException.class,
                () -> prescriptionService
                        .downloadPrescriptionPdf(1000L)
        );

        verify(prescriptionPdfService, never())
                .generatePrescriptionPdf(
                        any(),
                        any()
                );
    }

     

    private void mockCurrentDoctor() {

        authenticate(doctorUser);

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(100L);

        when(userRepository
                .findByEmail(doctorUser.getEmail()))
                .thenReturn(Optional.of(doctorUser));

        when(doctorRepository
                .findByUserIdAndDeletedAtIsNull(doctorUser.getId()))
                .thenReturn(Optional.of(doctor));
    }

    private void mockCurrentUser(User user) {

        authenticate(user);

        when(tenantContextService
                .getCurrentHospitalId())
                .thenReturn(100L);

        when(userRepository
                .findByEmail(user.getEmail()))
                .thenReturn(Optional.of(user));
    }
    
    private void authenticate(User user) {

        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                        user.getEmail(),
                        null,
                        List.of()
                );

        SecurityContextHolder.getContext()
                .setAuthentication(authentication);
    }

    private void mockPrescription() {

        when(prescriptionRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(
                        1000L,
                        100L
                ))
                .thenReturn(Optional.of(prescription));
    }

    private AddPrescriptionItemRequest
    validManualMedicineRequest() {

        AddPrescriptionItemRequest request =
                new AddPrescriptionItemRequest();

        request.setMedicineName("Manual Medicine");
        request.setStrength("100mg");
        request.setDosage("1 tablet");
        request.setQuantity(10);
        request.setFrequency("Once daily");
        request.setDuration("5 days");

        return request;
    }
}