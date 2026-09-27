package com.medcore.features.notification.service;

public interface EmailService {

    void send(
            String recipient,
            String subject,
            String body
    );

    void sendHospitalAdminCredentials(
            String email,
            String fullName,
            String temporaryPassword,
            String hospitalName
    );

    void sendDoctorCredentials(
            String email,
            String fullName,
            String temporaryPassword,
            String hospitalName
    );

    void sendNurseCredentials(
            String email,
            String fullName,
            String temporaryPassword,
            String hospitalName
    );

    void sendAccountantCredentials(
            String email,
            String fullName,
            String temporaryPassword,
            String hospitalName
    );

    void sendReceptionistCredentials(
            String email,
            String fullName,
            String temporaryPassword,
            String hospitalName
    );
}