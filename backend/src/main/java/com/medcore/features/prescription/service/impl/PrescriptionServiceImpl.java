package com.medcore.features.prescription.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.security.SecurityUtil;
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
import com.medcore.features.prescription.service.PrescriptionService;

import com.medcore.features.user.entity.User;
import com.medcore.features.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PrescriptionServiceImpl
        implements PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final AppointmentRepository appointmentRepository;

    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    private final UserRepository userRepository;

    private final PrescriptionMapper prescriptionMapper;
    private final PrescriptionItemMapper prescriptionItemMapper;

    private final MedicineRepository medicineRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;

    private final PrescriptionPdfService prescriptionPdfService;

    private final TenantContextService tenantContextService;


    @Override
    public ApiResponse<PrescriptionResponse> createPrescription(
            CreatePrescriptionRequest request) {

        User currentUser =
                getCurrentUser();

        Doctor currentDoctor =
                doctorRepository
                        .findByUserIdAndDeletedAtIsNull(
                                currentUser.getId()
                        )
                        .orElseThrow(() ->
                                new BusinessException(
                                        "Only doctors can create prescriptions"
                                ));


        Appointment appointment =
                appointmentRepository
                        .findByIdAndDeletedAtIsNull(
                                request.getAppointmentId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Appointment not found"
                                ));


        validateAppointmentHospital(
                appointment
        );


        if (appointment.getDoctor() == null
                || !appointment.getDoctor()
                        .getId()
                        .equals(currentDoctor.getId())) {

            throw new BusinessException(
                    "You are not authorized to create a prescription for this appointment"
            );
        }

        if (appointment.getStatus()
                != AppointmentStatus.COMPLETED) {

            throw new BusinessException(
                    "Prescription can only be created for a completed appointment"
            );
        }


        if (prescriptionRepository
                .existsByAppointmentIdAndDeletedAtIsNull(
                        appointment.getId()
                )) {

            throw new BusinessException(
                    "Prescription already exists for this appointment"
            );
        }

        Doctor doctor =
                appointment.getDoctor();

        Patient patient =
                appointment.getPatient();

        Hospital hospital =
                appointment.getHospital();


        Prescription prescription =
                prescriptionMapper.toEntity(
                        request,
                        appointment,
                        doctor,
                        patient,
                        hospital
                );

        Prescription savedPrescription =
                prescriptionRepository.save(
                        prescription
                );

        return ApiResponse.<PrescriptionResponse>builder()
                .success(true)
                .message("Prescription created successfully")
                .data(
                        prescriptionMapper.toResponse(
                                savedPrescription,
                                List.of()
                        )
                )
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<PrescriptionItemResponse> addMedicine(
        Long prescriptionId,
        AddPrescriptionItemRequest request) {

    
    User currentUser = getCurrentUser();

    
    Doctor currentDoctor =
            doctorRepository
                    .findByUserIdAndDeletedAtIsNull(
                            currentUser.getId()
                    )
                    .orElseThrow(() ->
                            new BusinessException(
                                    "Only doctors can add medicines to prescriptions"
                            ));

     
    Prescription prescription =
            getPrescription(prescriptionId);

    
    validateHospitalIsolation(prescription);

     
    validateDoctorOwnership(
            prescription,
            currentDoctor,
            "You are not authorized to modify this prescription"
    );

     
    validateDraftPrescription(prescription);

    
    validateMedicineInput(request);

    
    PrescriptionItem item =
            new PrescriptionItem();

    item.setPrescription(prescription);

    item.setDosage(
            request.getDosage().trim()
    );

    item.setQuantity(
            request.getQuantity()
    );

    item.setFrequency(
            request.getFrequency().trim()
    );

    item.setDuration(
            request.getDuration().trim()
    );

    item.setInstructions(
            request.getInstructions() != null
                    ? request.getInstructions().trim()
                    : null
    );

     
    applyMedicineData(
            item,
            request
    );

    
    PrescriptionItem savedItem =
            prescriptionItemRepository.save(item);

     
    return ApiResponse.<PrescriptionItemResponse>builder()
            .success(true)
            .message(
                    "Medicine added to prescription successfully"
            )
            .data(
                    prescriptionItemMapper.toResponse(
                            savedItem
                    )
            )
            .build();
}		

@Override
@Transactional
public ApiResponse<PrescriptionItemResponse> updateMedicine(
        Long prescriptionId,
        Long itemId,
        AddPrescriptionItemRequest request) {

     
    User currentUser = getCurrentUser();

     
    Doctor currentDoctor =
            doctorRepository
                    .findByUserIdAndDeletedAtIsNull(
                            currentUser.getId()
                    )
                    .orElseThrow(() ->
                            new BusinessException(
                                    "Only doctors can update prescription medicines"
                            ));

     
    Prescription prescription =
            getPrescription(prescriptionId);

    
    validateHospitalIsolation(prescription);

    
    validateDoctorOwnership(
            prescription,
            currentDoctor,
            "You are not authorized to modify this prescription"
    );

     
    validateDraftPrescription(prescription);

    
    PrescriptionItem item =
            prescriptionItemRepository
                    .findByIdAndPrescriptionIdAndDeletedAtIsNull(
                            itemId,
                            prescriptionId
                    )
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Prescription medicine not found"
                            ));

     
    validateMedicineInput(request);

    
    item.setDosage(
            request.getDosage().trim()
    );

    item.setQuantity(
            request.getQuantity()
    );

    item.setFrequency(
            request.getFrequency().trim()
    );

    item.setDuration(
            request.getDuration().trim()
    );

    item.setInstructions(
            request.getInstructions() != null
                    ? request.getInstructions().trim()
                    : null
    );
   
    applyMedicineData(
            item,
            request
    );

    
    PrescriptionItem savedItem =
            prescriptionItemRepository.save(item);

     
    return ApiResponse.<PrescriptionItemResponse>builder()
            .success(true)
            .message(
                    "Prescription medicine updated successfully"
            )
            .data(
                    prescriptionItemMapper.toResponse(
                            savedItem
                    )
            )
            .build();
}


@Override
public ApiResponse<PrescriptionResponse> getPrescriptionById(
        Long prescriptionId) {

    User currentUser =
            getCurrentUser();

    Prescription prescription =
            getPrescription(
                    prescriptionId
            );

    
    validateHospitalIsolation(
            prescription
    );

    
    validatePrescriptionAccess(
            prescription,
            currentUser
    );

    List<PrescriptionItemResponse> medicines =
            getPrescriptionItems(
                    prescription.getId()
            );

    return ApiResponse.<PrescriptionResponse>builder()
            .success(true)
            .message(
                    "Prescription fetched successfully"
            )
            .data(
                    prescriptionMapper.toResponse(
                            prescription,
                            medicines
                    )
            )
            .build();
}

@Override
@Transactional
public ApiResponse<PrescriptionResponse> finalizePrescription(
        Long prescriptionId) {

    User currentUser =
            getCurrentUser();

    Doctor currentDoctor =
            doctorRepository
                    .findByUserIdAndDeletedAtIsNull(
                            currentUser.getId()
                    )
                    .orElseThrow(() ->
                            new BusinessException(
                                    "Only doctors can finalize prescriptions"
                            ));

    Prescription prescription =
            getPrescription(
                    prescriptionId
            );

    validateHospitalIsolation(
            prescription
    );

    validateDoctorOwnership(
            prescription,
            currentDoctor,
            "You are not authorized to finalize this prescription"
    );

     
    validateDraftPrescription(
            prescription
    );

    
    boolean hasMedicine =
            prescriptionItemRepository
                    .existsByPrescriptionIdAndDeletedAtIsNull(
                            prescription.getId()
                    );

    if (!hasMedicine) {
        throw new BusinessException(
                "Prescription must contain at least one medicine"
        );
    }

     
    prescription.setStatus(
            PrescriptionStatus.FINALIZED
    );

    Prescription savedPrescription =
            prescriptionRepository.save(
                    prescription
            );

    List<PrescriptionItemResponse> medicines =
            getPrescriptionItems(
                    savedPrescription.getId()
            );

    return ApiResponse.<PrescriptionResponse>builder()
            .success(true)
            .message(
                    "Prescription finalized successfully"
            )
            .data(
                    prescriptionMapper.toResponse(
                            savedPrescription,
                            medicines
                    )
            )
            .build();
}

@Override
@Transactional
public ApiResponse<PrescriptionResponse>
sharePrescriptionWithPatient(
        Long prescriptionId) {

    User currentUser =
            getCurrentUser();

    Doctor currentDoctor =
            doctorRepository
                    .findByUserIdAndDeletedAtIsNull(
                            currentUser.getId()
                    )
                    .orElseThrow(() ->
                            new BusinessException(
                                    "Only doctors can share prescriptions"
                            ));

    Prescription prescription =
            getPrescription(
                    prescriptionId
            );

    validateHospitalIsolation(
            prescription
    );

    validateDoctorOwnership(
            prescription,
            currentDoctor,
            "You are not authorized to share this prescription"
    );

     
    if (prescription.getStatus()
            != PrescriptionStatus.FINALIZED) {

        throw new BusinessException(
                "Only finalized prescriptions can be shared"
        );
    }

    
    if (Boolean.TRUE.equals(
            prescription.getSharedWithPatient())) {

        throw new BusinessException(
                "Prescription is already shared with the patient"
        );
    }

    prescription.setSharedWithPatient(
            true
    );

    Prescription savedPrescription =
            prescriptionRepository.save(
                    prescription
            );

    List<PrescriptionItemResponse> medicines =
            getPrescriptionItems(
                    savedPrescription.getId()
            );

    return ApiResponse.<PrescriptionResponse>builder()
            .success(true)
            .message(
                    "Prescription shared with patient successfully"
            )
            .data(
                    prescriptionMapper.toResponse(
                            savedPrescription,
                            medicines
                    )
            )
            .build();
}

@Override
public ApiResponse<PrescriptionResponse> getPatientPrescription(
        Long prescriptionId) {

    User currentUser =
            getCurrentUser();

    Patient currentPatient =
            patientRepository
                    .findByUserId(
                            currentUser.getId()
                    )
                    .orElseThrow(() ->
                            new BusinessException(
                                    "Only patients can access this endpoint"
                            ));

    Prescription prescription =
            getPrescription(
                    prescriptionId
            );


    validateHospitalIsolation(
            prescription
    );


    validatePatientPrescriptionAccess(
            prescription,
            currentPatient
    );


    List<PrescriptionItemResponse> medicines =
            getPrescriptionItems(
                    prescription.getId()
            );


    PrescriptionResponse response =
            prescriptionMapper.toResponse(
                    prescription,
                    medicines
            );

    return ApiResponse.<PrescriptionResponse>builder()
            .success(true)
            .message(
                    "Prescription fetched successfully"
            )
            .data(response)
            .build();
}

@Override
@Transactional
public ApiResponse<Void> deleteMedicine(
            Long prescriptionId,
            Long itemId) {

        User currentUser =
                getCurrentUser();

        Doctor currentDoctor =
                doctorRepository
                        .findByUserIdAndDeletedAtIsNull(
                                currentUser.getId()
                        )
                        .orElseThrow(() ->
                                new BusinessException(
                                        "Only doctors can delete prescription medicines"
                                ));

        Prescription prescription =
                getPrescription(
                        prescriptionId
                );

         
        validateHospitalIsolation(
                prescription
        );

         
        validateDoctorOwnership(
                prescription,
                currentDoctor,
                "You are not authorized to modify this prescription"
        );

     
        validateDraftPrescription(
                prescription
        );

        PrescriptionItem item =
                prescriptionItemRepository
                        .findByIdAndPrescriptionIdAndDeletedAtIsNull(
                                itemId,
                                prescriptionId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Prescription medicine not found"
                                ));

        item.setDeletedAt(
                java.time.LocalDateTime.now()
        );

        prescriptionItemRepository.save(
                item
        );

        return ApiResponse.<Void>builder()
                .success(true)
                .message(
                        "Prescription medicine deleted successfully"
                )
                .data(null)
                .build();
    }


    
@Override
public ResponseEntity<byte[]> downloadPrescriptionPdf(
        Long prescriptionId) {

    User currentUser =
            getCurrentUser();

    Patient currentPatient =
            patientRepository
                    .findByUserId(
                            currentUser.getId()
                    )
                    .orElseThrow(() ->
                            new BusinessException(
                                    "Only patients can download prescriptions"
                            )
                    );


    Prescription prescription =
            getPrescription(
                    prescriptionId
            );

    validateHospitalIsolation(
            prescription
    );


    if (prescription.getPatient() == null
            || !prescription.getPatient()
                    .getId()
                    .equals(currentPatient.getId())) {

        throw new BusinessException(
                "You are not authorized to download this prescription"
        );
    }


    if (prescription.getStatus()
            != PrescriptionStatus.FINALIZED) {

        throw new BusinessException(
                "Prescription is not finalized"
        );
    }


    if (!Boolean.TRUE.equals(
            prescription.getSharedWithPatient())) {

        throw new BusinessException(
                "Prescription has not been shared with you"
        );
    }


    List<PrescriptionItem> items =
            prescriptionItemRepository
                    .findByPrescriptionIdAndDeletedAtIsNull(
                            prescription.getId()
                    );


    byte[] pdf =
            prescriptionPdfService
                    .generatePrescriptionPdf(
                            prescription,
                            items
                    );


    return ResponseEntity
            .ok()
            .header(
                    HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=prescription-"
                            + prescription.getId()
                            + ".pdf"
            )
            .contentType(
                    MediaType.APPLICATION_PDF
            )
            .contentLength(
                    pdf.length
            )
            .body(pdf);
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


    private Prescription getPrescription(
            Long prescriptionId) {

        return prescriptionRepository
                .findByIdAndDeletedAtIsNull(
                        prescriptionId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Prescription not found"
                        ));
    }



    private void validateAppointmentHospital(
            Appointment appointment) {

        Long hospitalId =
                tenantContextService
                        .getCurrentHospitalId();

        if (hospitalId != null
                && (appointment.getHospital() == null
                || !appointment.getHospital()
                        .getId()
                        .equals(hospitalId))) {

            throw new BusinessException(
                    "You are not authorized to access this hospital data"
            );
        }
    }


    private void validateHospitalIsolation(
            Prescription prescription) {

        Long hospitalId =
                tenantContextService
                        .getCurrentHospitalId();

        if (hospitalId != null
                && (prescription.getHospital() == null
                || !prescription.getHospital()
                        .getId()
                        .equals(hospitalId))) {

            throw new BusinessException(
                    "You are not authorized to access this hospital data"
            );
        }
    }

    private void validateDoctorOwnership(
            Prescription prescription,
            Doctor currentDoctor,
            String message) {

        if (prescription.getDoctor() == null
                || !prescription.getDoctor()
                        .getId()
                        .equals(currentDoctor.getId())) {

            throw new BusinessException(
                    message
            );
        }
    }



    private void validateDraftPrescription(
            Prescription prescription) {

        if (prescription.getStatus()
                != PrescriptionStatus.DRAFT) {

            throw new BusinessException(
                    "Only draft prescriptions can be modified"
            );
        }
    }


    private List<PrescriptionItemResponse>
    getPrescriptionItems(
            Long prescriptionId) {

        return prescriptionItemRepository
                .findByPrescriptionIdAndDeletedAtIsNull(
                        prescriptionId
                )
                .stream()
                .map(prescriptionItemMapper::toResponse)
                .toList();
    }


private void validatePrescriptionAccess(
        Prescription prescription,
        User currentUser) {

    boolean isDoctor =
            doctorRepository
                    .findByUserIdAndDeletedAtIsNull(
                            currentUser.getId()
                    )
                    .map(doctor ->
                            prescription.getDoctor() != null
                                    && prescription.getDoctor()
                                    .getId()
                                    .equals(doctor.getId())
                    )
                    .orElse(false);

    if (isDoctor) {
        return;
    }


    Patient currentPatient =
            patientRepository
                    .findByUserId(
                            currentUser.getId()
                    )
                    .orElse(null);

    if (currentPatient != null) {

        validatePatientPrescriptionAccess(
                prescription,
                currentPatient
        );

        return;
    }


    throw new BusinessException(
            "You are not authorized to access this prescription"
    );
}
    
    private void validatePatientPrescriptionAccess(
            Prescription prescription,
            Patient currentPatient) {

        if (prescription.getPatient() == null
                || !prescription.getPatient()
                        .getId()
                        .equals(currentPatient.getId())) {

            throw new BusinessException(
                    "You are not authorized to access this prescription"
            );
        }

        if (prescription.getStatus()
                != PrescriptionStatus.FINALIZED) {

            throw new BusinessException(
                    "Prescription is not finalized yet"
            );
        }

         
        if (!Boolean.TRUE.equals(
                prescription.getSharedWithPatient())) {

            throw new BusinessException(
                    "This prescription has not been shared with you yet"
            );
        }
    }
    
    private void validateMedicineInput(
            AddPrescriptionItemRequest request) {

        boolean hasMedicineId =
                request.getMedicineId() != null;

        boolean hasManualMedicine =
                request.getMedicineName() != null
                        && !request.getMedicineName()
                        .trim()
                        .isEmpty();

        if (!hasMedicineId && !hasManualMedicine) {

            throw new BusinessException(
                    "Please select an existing medicine or enter a medicine name"
            );
        }

        if (hasMedicineId && hasManualMedicine) {

            throw new BusinessException(
                    "Please provide either medicineId or medicineName, not both"
            );
        }
    }


    private void applyMedicineData(
            PrescriptionItem item,
            AddPrescriptionItemRequest request) {

        // Existing medicine
        if (request.getMedicineId() != null) {

            Medicine medicine =
                    medicineRepository
                            .findByIdAndDeletedAtIsNull(
                                    request.getMedicineId()
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Medicine not found"
                                    ));

            if (!Boolean.TRUE.equals(
                    medicine.getActive())) {

                throw new BusinessException(
                        "This medicine is not active"
                );
            }

            item.setMedicine(medicine);

            // Snapshot
            item.setMedicineName(
                    medicine.getName()
            );

            if (request.getStrength() != null
                    && !request.getStrength()
                            .trim()
                            .isEmpty()) {

                item.setStrength(
                        request.getStrength().trim()
                );

            } else {

                item.setStrength(
                        medicine.getStrength()
                );
            }

        }

        // Manual medicine
        else {

            item.setMedicine(null);

            item.setMedicineName(
                    request.getMedicineName()
                            .trim()
            );

            item.setStrength(
                    request.getStrength() != null
                            ? request.getStrength().trim()
                            : null
            );
        }
    }
}