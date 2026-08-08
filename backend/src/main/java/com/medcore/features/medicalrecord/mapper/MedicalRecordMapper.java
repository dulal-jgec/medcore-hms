package com.medcore.features.medicalrecord.mapper;

import com.medcore.features.medicalrecord.dto.request.CreateMedicalRecordRequest;
import com.medcore.features.medicalrecord.dto.response.MedicalRecordResponse;
import com.medcore.features.medicalrecord.entity.MedicalRecord;
import org.springframework.stereotype.Component;

@Component
public class MedicalRecordMapper {

    public MedicalRecordResponse toResponse(
            MedicalRecord record) {

        return MedicalRecordResponse.builder()
                .id(record.getId())

                .appointmentId(
                        record.getAppointment().getId()
                )

                .patientId(
                        record.getPatient().getId()
                )
                .patientName(
                        record.getPatient().getUser().getFullName()
                )

                .doctorId(
                        record.getDoctor().getId()
                )
                .doctorName(
                        record.getDoctor().getUser().getFullName()
                )

                .hospitalId(
                        record.getHospital().getId()
                )
                .hospitalName(
                        record.getHospital().getName()
                )

                .symptoms(record.getSymptoms())
                .diagnosis(record.getDiagnosis())
                .examinationNotes(record.getExaminationNotes())
                .treatmentNotes(record.getTreatmentNotes())

                .createdAt(record.getCreatedAt())
                .updatedAt(record.getUpdatedAt())

                .build();
    }
    
    public MedicalRecord toEntity(
            CreateMedicalRecordRequest request) {

        return MedicalRecord.builder()
                .symptoms(request.getSymptoms().trim())
                .diagnosis(request.getDiagnosis().trim())
                .examinationNotes(
                        request.getExaminationNotes() != null
                                ? request.getExaminationNotes().trim()
                                : null
                )
                .treatmentNotes(
                        request.getTreatmentNotes() != null
                                ? request.getTreatmentNotes().trim()
                                : null
                )
                .build();
    }
}