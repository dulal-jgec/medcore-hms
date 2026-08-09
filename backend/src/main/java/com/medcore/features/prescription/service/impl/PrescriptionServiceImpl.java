package com.medcore.features.prescription.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.features.patient.repository.PatientRepository;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.security.SecurityUtil;

import com.medcore.features.appointment.entity.Appointment;
import com.medcore.features.appointment.enums.AppointmentStatus;
import com.medcore.features.appointment.repository.AppointmentRepository;

import com.medcore.features.doctor.entity.Doctor;
import com.medcore.features.doctor.repository.DoctorRepository;

import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.patient.entity.Patient;

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

import com.medcore.features.prescription.service.PrescriptionService;

import com.medcore.features.user.entity.User;
import com.medcore.features.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import org.springframework.http.HttpHeaders;
import java.util.List;
 
import org.springframework.http.MediaType;
import com.medcore.features.prescription.service.PrescriptionPdfService;
@Service
@RequiredArgsConstructor
public class PrescriptionServiceImpl implements PrescriptionService {

	private final PrescriptionRepository prescriptionRepository;
	private final AppointmentRepository appointmentRepository;
	private final DoctorRepository doctorRepository;
	private final UserRepository userRepository;
	private final PrescriptionMapper prescriptionMapper;
	private final MedicineRepository medicineRepository;
	private final PrescriptionItemRepository prescriptionItemRepository;
	private final PrescriptionItemMapper prescriptionItemMapper;
	private final PatientRepository patientRepository;

 	private final PrescriptionPdfService prescriptionPdfService;
	
    @Override
    public ApiResponse<PrescriptionResponse> createPrescription(
            CreatePrescriptionRequest request) {

        // 1. Get logged-in user
        User currentUser = getCurrentUser();

        // 2. Logged-in user must be a doctor
        Doctor currentDoctor = doctorRepository
                .findByUserId(currentUser.getId())
                .orElseThrow(() ->
                        new BusinessException(
                                "Only doctors can create prescriptions"
                        ));

        // 3. Find appointment
        Appointment appointment = appointmentRepository
                .findByIdAndDeletedAtIsNull(
                        request.getAppointmentId()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Appointment not found"
                        ));

        // 4. Doctor must own this appointment
        if (!appointment.getDoctor().getId()
                .equals(currentDoctor.getId())) {

            throw new BusinessException(
                    "You are not authorized to create a prescription for this appointment"
            );
        }

        // 5. Hospital isolation
        if (currentUser.getHospital() == null
                || !appointment.getHospital().getId()
                .equals(currentUser.getHospital().getId())) {

            throw new BusinessException(
                    "You are not authorized to access this hospital data"
            );
        }

        // 6. Appointment must be completed
        if (appointment.getStatus()
                != AppointmentStatus.COMPLETED) {

            throw new BusinessException(
                    "Prescription can only be created for a completed appointment"
            );
        }

        // 7. Prevent duplicate prescription
        if (prescriptionRepository
                .existsByAppointmentIdAndDeletedAtIsNull(
                        appointment.getId()
                )) {

            throw new BusinessException(
                    "Prescription already exists for this appointment"
            );
        }

        // 8. Trusted data comes from appointment
        Doctor doctor = appointment.getDoctor();
        Patient patient = appointment.getPatient();
        Hospital hospital = appointment.getHospital();

        // 9. Build prescription
        Prescription prescription =
                prescriptionMapper.toEntity(
                        request,
                        appointment,
                        doctor,
                        patient,
                        hospital
                );

        // 10. Save
        Prescription savedPrescription =
                prescriptionRepository.save(prescription);

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

    private User getCurrentUser() {

        String email = SecurityUtil.getCurrentUsername();

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Current user not found"
                        ));
    }
    
@Override
public ApiResponse<PrescriptionItemResponse> addMedicine(
        Long prescriptionId,
        AddPrescriptionItemRequest request) {

    // 1. Get logged-in user
    User currentUser = getCurrentUser();

    // 2. Only doctor can add medicines
    Doctor currentDoctor = doctorRepository
            .findByUserId(currentUser.getId())
            .orElseThrow(() ->
                    new BusinessException(
                            "Only doctors can add medicines to prescriptions"
                    ));

    // 3. Find prescription
    Prescription prescription =
            prescriptionRepository
                    .findByIdAndDeletedAtIsNull(prescriptionId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Prescription not found"
                            ));

    // 4. Doctor ownership
    if (!prescription.getDoctor().getId()
            .equals(currentDoctor.getId())) {

        throw new BusinessException(
                "You are not authorized to modify this prescription"
        );
    }

    // 5. Hospital isolation
    if (currentUser.getHospital() == null
            || prescription.getHospital() == null
            || !prescription.getHospital().getId()
                    .equals(currentUser.getHospital().getId())) {

        throw new BusinessException(
                "You are not authorized to access this hospital data"
        );
    }

    // 6. Only DRAFT prescription can be modified
    if (prescription.getStatus()
            != PrescriptionStatus.DRAFT) {

        throw new BusinessException(
                "Only draft prescriptions can be modified"
        );
    }

    // ---------------------------------------------------------
    // 7. Validate medicine input
    // ---------------------------------------------------------

    boolean hasMedicineId =
            request.getMedicineId() != null;

    boolean hasManualMedicine =
            request.getMedicineName() != null
                    && !request.getMedicineName().trim().isEmpty();

    if (!hasMedicineId && !hasManualMedicine) {

        throw new BusinessException(
                "Please select an existing medicine or enter a medicine name"
        );
    }

    // ---------------------------------------------------------
    // 8. Build PrescriptionItem
    // ---------------------------------------------------------

    PrescriptionItem item =
            new PrescriptionItem();

    item.setPrescription(prescription);

    item.setDosage(request.getDosage());
    item.setQuantity(request.getQuantity());
    item.setFrequency(request.getFrequency());
    item.setDuration(request.getDuration());
    item.setInstructions(request.getInstructions());

    // ---------------------------------------------------------
    // 9. Existing medicine
    // ---------------------------------------------------------

    if (hasMedicineId) {

        Medicine medicine =
                medicineRepository
                        .findByIdAndDeletedAtIsNull(
                                request.getMedicineId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Medicine not found"
                                ));

        // Medicine must be active
        if (!Boolean.TRUE.equals(
                medicine.getActive())) {

            throw new BusinessException(
                    "This medicine is not active"
            );
        }

        item.setMedicine(medicine);

        // Keep snapshot data
        item.setMedicineName(
                medicine.getName()
        );

        // Doctor can override strength if provided
        if (request.getStrength() != null
                && !request.getStrength()
                        .trim()
                        .isEmpty()) {

            item.setStrength(
                    request.getStrength()
            );

        } else {

            item.setStrength(
                    medicine.getStrength()
            );
        }
    }

    // ---------------------------------------------------------
    // 10. Manual medicine
    // ---------------------------------------------------------

    else {

        item.setMedicine(null);

        item.setMedicineName(
                request.getMedicineName().trim()
        );

        item.setStrength(
                request.getStrength()
        );
    }

    // ---------------------------------------------------------
    // 11. Save
    // ---------------------------------------------------------

    PrescriptionItem savedItem =
            prescriptionItemRepository.save(item);

    // ---------------------------------------------------------
    // 12. Response
    // ---------------------------------------------------------

    return ApiResponse.<PrescriptionItemResponse>builder()
            .success(true)
            .message("Medicine added to prescription successfully")
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

    User currentUser = getCurrentUser();

    Prescription prescription =
            prescriptionRepository
                    .findByIdAndDeletedAtIsNull(
                            prescriptionId
                    )
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Prescription not found"
                            ));

    // Doctor or patient must belong to this prescription
    validatePrescriptionAccess(
            prescription,
            currentUser
    );

    List<PrescriptionItemResponse> medicines =
            prescriptionItemRepository
                    .findByPrescriptionIdAndDeletedAtIsNull(
                            prescription.getId()
                    )
                    .stream()
                    .map(prescriptionItemMapper::toResponse)
                    .toList();

    PrescriptionResponse response =
            prescriptionMapper.toResponse(
                    prescription,
                    medicines
            );

    return ApiResponse.<PrescriptionResponse>builder()
            .success(true)
            .message("Prescription fetched successfully")
            .data(response)
            .build();
}


// ---------------------------------------------------------
// Helper Method
// ---------------------------------------------------------

private void validatePrescriptionAccess(
        Prescription prescription,
        User currentUser) {

    boolean authorized = false;

    // Hospital isolation first
    if (currentUser.getHospital() == null
            || prescription.getHospital() == null
            || !prescription.getHospital().getId()
                    .equals(currentUser.getHospital().getId())) {

        throw new BusinessException(
                "You are not authorized to access this hospital data"
        );
    }

    // Check whether current user is the doctor
    boolean isDoctor =
            doctorRepository.findByUserId(currentUser.getId())
                    .map(doctor ->
                            prescription.getDoctor().getId()
                                    .equals(doctor.getId())
                    )
                    .orElse(false);

    if (isDoctor) {
        authorized = true;
    }

    // Check whether current user is the patient
    boolean isPatient =
            patientRepository.findByUserId(currentUser.getId())
                    .map(patient ->
                            prescription.getPatient().getId()
                                    .equals(patient.getId())
                    )
                    .orElse(false);

    if (isPatient) {
        authorized = true;
    }

    if (!authorized) {
        throw new BusinessException(
                "You are not authorized to access this prescription"
        );
    }
}		
@Override
public ApiResponse<PrescriptionResponse> finalizePrescription(
        Long prescriptionId) {

    // 1. Get logged-in user
    User currentUser = getCurrentUser();

    // 2. Only doctor can finalize
    Doctor currentDoctor = doctorRepository
            .findByUserId(currentUser.getId())
            .orElseThrow(() ->
                    new BusinessException(
                            "Only doctors can finalize prescriptions"
                    ));

    // 3. Find prescription
    Prescription prescription =
            prescriptionRepository
                    .findByIdAndDeletedAtIsNull(prescriptionId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Prescription not found"
                            ));

    // 4. Doctor ownership
    if (!prescription.getDoctor().getId()
            .equals(currentDoctor.getId())) {

        throw new BusinessException(
                "You are not authorized to finalize this prescription"
        );
    }

    // 5. Hospital isolation
    if (currentUser.getHospital() == null
            || prescription.getHospital() == null
            || !prescription.getHospital().getId()
                    .equals(currentUser.getHospital().getId())) {

        throw new BusinessException(
                "You are not authorized to access this hospital data"
        );
    }

    // 6. Must be DRAFT
    if (prescription.getStatus()
            != PrescriptionStatus.DRAFT) {

        throw new BusinessException(
                "Only draft prescriptions can be finalized"
        );
    }

    // 7. Must contain at least one medicine
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

    // 8. Change status
    prescription.setStatus(
            PrescriptionStatus.FINALIZED
    );

    // 9. Save
    Prescription savedPrescription =
            prescriptionRepository.save(prescription);

    // 10. Load medicines for response
    List<PrescriptionItemResponse> medicines =
            prescriptionItemRepository
                    .findByPrescriptionIdAndDeletedAtIsNull(
                            savedPrescription.getId()
                    )
                    .stream()
                    .map(prescriptionItemMapper::toResponse)
                    .toList();

    return ApiResponse.<PrescriptionResponse>builder()
            .success(true)
            .message("Prescription finalized successfully")
            .data(
                    prescriptionMapper.toResponse(
                            savedPrescription,
                            medicines
                    )
            )
            .build();
}		

@Override
public ApiResponse<PrescriptionResponse> sharePrescriptionWithPatient(
        Long prescriptionId) {

    User currentUser = getCurrentUser();

    Doctor currentDoctor = doctorRepository
            .findByUserId(currentUser.getId())
            .orElseThrow(() ->
                    new BusinessException(
                            "Only doctors can share prescriptions"
                    ));

    Prescription prescription =
            prescriptionRepository
                    .findByIdAndDeletedAtIsNull(prescriptionId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Prescription not found"
                            ));

    // Doctor ownership
    if (!prescription.getDoctor().getId()
            .equals(currentDoctor.getId())) {

        throw new BusinessException(
                "You are not authorized to share this prescription"
        );
    }

    // Hospital isolation
    if (currentUser.getHospital() == null
            || prescription.getHospital() == null
            || !prescription.getHospital().getId()
                    .equals(currentUser.getHospital().getId())) {

        throw new BusinessException(
                "You are not authorized to access this hospital data"
        );
    }

    // Prescription must be finalized first
    if (prescription.getStatus()
            != PrescriptionStatus.FINALIZED) {

        throw new BusinessException(
                "Only finalized prescriptions can be shared"
        );
    }

    // Prevent duplicate sharing
    if (Boolean.TRUE.equals(
            prescription.getSharedWithPatient())) {

        throw new BusinessException(
                "Prescription is already shared with the patient"
        );
    }

    prescription.setSharedWithPatient(true);

    Prescription savedPrescription =
            prescriptionRepository.save(prescription);

    List<PrescriptionItemResponse> medicines =
            prescriptionItemRepository
                    .findByPrescriptionIdAndDeletedAtIsNull(
                            savedPrescription.getId()
                    )
                    .stream()
                    .map(prescriptionItemMapper::toResponse)
                    .toList();

    return ApiResponse.<PrescriptionResponse>builder()
            .success(true)
            .message("Prescription shared with patient successfully")
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

    // 1. Get logged-in user
    User currentUser = getCurrentUser();

    // 2. Current user must be a patient
    Patient currentPatient = patientRepository
            .findByUserId(currentUser.getId())
            .orElseThrow(() ->
                    new BusinessException(
                            "Only patients can access this endpoint"
                    ));

    // 3. Find prescription
    Prescription prescription =
            prescriptionRepository
                    .findByIdAndDeletedAtIsNull(
                            prescriptionId
                    )
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Prescription not found"
                            ));

    // 4. Prescription must belong to this patient
    if (!prescription.getPatient().getId()
            .equals(currentPatient.getId())) {

        throw new BusinessException(
                "You are not authorized to access this prescription"
        );
    }

    // 5. Hospital isolation
    if (currentUser.getHospital() == null
            || prescription.getHospital() == null
            || !prescription.getHospital().getId()
                    .equals(currentUser.getHospital().getId())) {

        throw new BusinessException(
                "You are not authorized to access this hospital data"
        );
    }

    // 6. Doctor must have shared it
    if (!Boolean.TRUE.equals(
            prescription.getSharedWithPatient())) {

        throw new BusinessException(
                "This prescription has not been shared with you yet"
        );
    }

    // 7. Prescription must be finalized
    if (prescription.getStatus()
            != PrescriptionStatus.FINALIZED) {

        throw new BusinessException(
                "Prescription is not finalized yet"
        );
    }

    // 8. Get medicines
    List<PrescriptionItemResponse> medicines =
            prescriptionItemRepository
                    .findByPrescriptionIdAndDeletedAtIsNull(
                            prescription.getId()
                    )
                    .stream()
                    .map(prescriptionItemMapper::toResponse)
                    .toList();

    // 9. Build response
    PrescriptionResponse response =
            prescriptionMapper.toResponse(
                    prescription,
                    medicines
            );

    return ApiResponse.<PrescriptionResponse>builder()
            .success(true)
            .message("Prescription fetched successfully")
            .data(response)
            .build();
}
@Override
public ApiResponse<PrescriptionItemResponse> updateMedicine(
        Long prescriptionId,
        Long itemId,
        AddPrescriptionItemRequest request) {

    // 1. Get logged-in user
    User currentUser = getCurrentUser();

    // 2. Only doctor can update medicines
    Doctor currentDoctor = doctorRepository
            .findByUserId(currentUser.getId())
            .orElseThrow(() ->
                    new BusinessException(
                            "Only doctors can update prescription medicines"
                    ));

    // 3. Find prescription
    Prescription prescription =
            prescriptionRepository
                    .findByIdAndDeletedAtIsNull(prescriptionId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Prescription not found"
                            ));

    // 4. Doctor ownership
    if (!prescription.getDoctor().getId()
            .equals(currentDoctor.getId())) {

        throw new BusinessException(
                "You are not authorized to modify this prescription"
        );
    }

    // 5. Hospital isolation
    if (currentUser.getHospital() == null
            || prescription.getHospital() == null
            || !prescription.getHospital().getId()
                    .equals(currentUser.getHospital().getId())) {

        throw new BusinessException(
                "You are not authorized to access this hospital data"
        );
    }

    // 6. Only DRAFT can be modified
    if (prescription.getStatus()
            != PrescriptionStatus.DRAFT) {

        throw new BusinessException(
                "Only draft prescriptions can be modified"
        );
    }

    // 7. Find prescription item
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

    // ---------------------------------------------------------
    // 8. Validate medicine input
    // ---------------------------------------------------------

    boolean hasMedicineId =
            request.getMedicineId() != null;

    boolean hasManualMedicine =
            request.getMedicineName() != null
                    && !request.getMedicineName()
                            .trim()
                            .isEmpty();

    // Must provide one
    if (!hasMedicineId && !hasManualMedicine) {

        throw new BusinessException(
                "Please select an existing medicine or enter a medicine name"
        );
    }

    // Cannot provide both
    if (hasMedicineId && hasManualMedicine) {

        throw new BusinessException(
                "Please provide either medicineId or medicineName, not both"
        );
    }

    // ---------------------------------------------------------
    // 9. Update common prescription fields
    // ---------------------------------------------------------

    item.setDosage(request.getDosage());
    item.setQuantity(request.getQuantity());
    item.setFrequency(request.getFrequency());
    item.setDuration(request.getDuration());
    item.setInstructions(request.getInstructions());

    // ---------------------------------------------------------
    // 10. Existing medicine selected
    // ---------------------------------------------------------

    if (hasMedicineId) {

        Medicine medicine =
                medicineRepository
                        .findByIdAndDeletedAtIsNull(
                                request.getMedicineId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Medicine not found"
                                ));

        // Medicine must be active
        if (!Boolean.TRUE.equals(
                medicine.getActive())) {

            throw new BusinessException(
                    "This medicine is not active"
            );
        }

        // Link medicine master
        item.setMedicine(medicine);

        // Store snapshot name
        item.setMedicineName(
                medicine.getName()
        );

        // Doctor can override strength
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

    // ---------------------------------------------------------
    // 11. Manual medicine
    // ---------------------------------------------------------

    else {

        // No medicine master reference
        item.setMedicine(null);

        // Doctor's manually typed medicine
        item.setMedicineName(
                request.getMedicineName().trim()
        );

        // Doctor's manually typed strength
        item.setStrength(
                request.getStrength()
        );
    }

    // ---------------------------------------------------------
    // 12. Save
    // ---------------------------------------------------------

    PrescriptionItem savedItem =
            prescriptionItemRepository.save(item);

    // ---------------------------------------------------------
    // 13. Response
    // ---------------------------------------------------------

    return ApiResponse.<PrescriptionItemResponse>builder()
            .success(true)
            .message("Prescription medicine updated successfully")
            .data(
                    prescriptionItemMapper.toResponse(
                            savedItem
                    )
            )
            .build();
}

@Override
public ApiResponse<Void> deleteMedicine(
        Long prescriptionId,
        Long itemId) {

    User currentUser = getCurrentUser();

    Doctor currentDoctor = doctorRepository
            .findByUserId(currentUser.getId())
            .orElseThrow(() ->
                    new BusinessException(
                            "Only doctors can delete prescription medicines"
                    ));

    Prescription prescription =
            prescriptionRepository
                    .findByIdAndDeletedAtIsNull(prescriptionId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Prescription not found"
                            ));

    if (!prescription.getDoctor().getId()
            .equals(currentDoctor.getId())) {

        throw new BusinessException(
                "You are not authorized to modify this prescription"
        );
    }

    if (currentUser.getHospital() == null
            || prescription.getHospital() == null
            || !prescription.getHospital().getId()
                    .equals(currentUser.getHospital().getId())) {

        throw new BusinessException(
                "You are not authorized to access this hospital data"
        );
    }

    if (prescription.getStatus()
            != PrescriptionStatus.DRAFT) {

        throw new BusinessException(
                "Only draft prescriptions can be modified"
        );
    }

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

    // Soft delete
    item.setDeletedAt(
            java.time.LocalDateTime.now()
    );

    prescriptionItemRepository.save(item);

    return ApiResponse.<Void>builder()
            .success(true)
            .message("Prescription medicine deleted successfully")
            .data(null)
            .build();
}

@Override
public ResponseEntity<byte[]> downloadPrescriptionPdf(
        Long prescriptionId) {

    // 1. Get logged-in user
    User currentUser = getCurrentUser();

    // 2. Only patient can download
    Patient currentPatient =
            patientRepository
                    .findByUserId(currentUser.getId())
                    .orElseThrow(() ->
                            new BusinessException(
                                    "Only patients can download prescriptions"
                            ));

    // 3. Find prescription
    Prescription prescription =
            prescriptionRepository
                    .findByIdAndDeletedAtIsNull(
                            prescriptionId
                    )
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Prescription not found"
                            ));

    // 4. Patient ownership
    if (!prescription.getPatient().getId()
            .equals(currentPatient.getId())) {

        throw new BusinessException(
                "You are not authorized to download this prescription"
        );
    }

    // 5. Hospital isolation
    if (currentUser.getHospital() == null
            || prescription.getHospital() == null
            || !prescription.getHospital().getId()
                    .equals(currentUser.getHospital().getId())) {

        throw new BusinessException(
                "You are not authorized to access this hospital data"
        );
    }

    // 6. Prescription must be finalized
    if (prescription.getStatus()
            != PrescriptionStatus.FINALIZED) {

        throw new BusinessException(
                "Prescription is not finalized"
        );
    }

    // 7. Doctor must share it
    if (!Boolean.TRUE.equals(
            prescription.getSharedWithPatient())) {

        throw new BusinessException(
                "Prescription has not been shared with you"
        );
    }

    // 8. Fetch prescription medicines
    List<PrescriptionItem> items =
            prescriptionItemRepository
                    .findByPrescriptionIdAndDeletedAtIsNull(
                            prescription.getId()
                    );

    // 9. Generate PDF
    byte[] pdf =
            prescriptionPdfService
                    .generatePrescriptionPdf(
                            prescription,
                            items
                    );

    // 10. Return PDF
    return ResponseEntity.ok()
            .header(
                    HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=prescription-"
                            + prescription.getId()
                            + ".pdf"
            )
            .contentType(
                    MediaType.APPLICATION_PDF
            )
            .contentLength(pdf.length)
            .body(pdf);
}
    
}