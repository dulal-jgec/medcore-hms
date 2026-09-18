package com.medcore.features.notification.service;

public interface EmailService {

    void sendHospitalAdminCredentials(
            String email,
            String fullName,
            String temporaryPassword,
            String hospitalName
    );
}
