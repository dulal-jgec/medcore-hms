package com.medcore.features.prescription.service.impl;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.medcore.common.exception.BusinessException;
import com.medcore.features.prescription.entity.Prescription;
import com.medcore.features.prescription.entity.PrescriptionItem;
import com.medcore.features.prescription.service.PrescriptionPdfService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PrescriptionPdfServiceImpl
        implements PrescriptionPdfService {

    @Override
    public byte[] generatePrescriptionPdf(
            Prescription prescription,
            List<PrescriptionItem> items) {

        try {

            ByteArrayOutputStream outputStream =
                    new ByteArrayOutputStream();

            Document document =
                    new Document();

            PdfWriter.getInstance(
                    document,
                    outputStream
            );

            document.open();

            // -----------------------------------------
            // Hospital
            // -----------------------------------------

            Font hospitalFont =
                    new Font(
                            Font.HELVETICA,
                            18,
                            Font.BOLD
                    );

            document.add(
                    new Paragraph(
                            prescription
                                    .getHospital()
                                    .getName(),
                            hospitalFont
                    )
            );

            document.add(
                    new Paragraph(
                            "Medical Prescription"
                    )
            );

            document.add(
                    new Paragraph(" ")
            );

            // -----------------------------------------
            // Doctor
            // -----------------------------------------

            document.add(
                    new Paragraph(
                            "Doctor: "
                                    + prescription
                                    .getDoctor()
                                    .getUser()
                                    .getFullName()
                    )
            );

            // -----------------------------------------
            // Patient
            // -----------------------------------------

            document.add(
                    new Paragraph(
                            "Patient: "
                                    + prescription
                                    .getPatient()
                                    .getUser()
                                    .getFullName()
                    )
            );

            // -----------------------------------------
            // Prescription Date
            // -----------------------------------------

            document.add(
                    new Paragraph(
                            "Date: "
                                    + prescription
                                    .getPrescriptionDate()
                    )
            );

            document.add(
                    new Paragraph(" ")
            );

            // -----------------------------------------
            // Medicine Table
            // -----------------------------------------

            PdfPTable table =
                    new PdfPTable(7);

            table.setWidthPercentage(100);

            addHeader(table, "Medicine");
            addHeader(table, "Strength");
            addHeader(table, "Dosage");
            addHeader(table, "Quantity");
            addHeader(table, "Frequency");
            addHeader(table, "Duration");
            addHeader(table, "Instructions");

            // Use the items passed from Service
for (PrescriptionItem item : items) {

    table.addCell(
            safeValue(item.getMedicineName())
    );

    table.addCell(
            safeValue(item.getStrength())
    );

    table.addCell(
            safeValue(item.getDosage())
    );

    table.addCell(
            String.valueOf(item.getQuantity())
    );

    table.addCell(
            safeValue(item.getFrequency())
    );

    table.addCell(
            safeValue(item.getDuration())
    );

    table.addCell(
            safeValue(item.getInstructions())
    );
}

            document.add(table);

            document.add(
                    new Paragraph(" ")
            );

            // -----------------------------------------
            // Footer
            // -----------------------------------------

            document.add(
                    new Paragraph(
                            "This prescription is digitally generated by MedCore."
                    )
            );

            document.close();

            return outputStream.toByteArray();

        } catch (DocumentException e) {

            throw new BusinessException(
                    "Failed to generate prescription PDF"
            );
        }
    }

    private void addHeader(
            PdfPTable table,
            String text) {

        PdfPCell cell =
                new PdfPCell(
                        new Phrase(text)
                );

        table.addCell(cell);
    }

    private String safeValue(String value) {

        return value != null
                ? value
                : "-";
    }
}