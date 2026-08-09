package com.medcore.features.prescription.service;

import com.medcore.features.prescription.entity.Prescription;
import com.medcore.features.prescription.entity.PrescriptionItem;

import java.util.List;

public interface PrescriptionPdfService {

    byte[] generatePrescriptionPdf(
            Prescription prescription,
            List<PrescriptionItem> items
    );
}