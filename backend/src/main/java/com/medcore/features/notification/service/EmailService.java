package com.medcore.features.notification.service;

public interface EmailService {

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
}