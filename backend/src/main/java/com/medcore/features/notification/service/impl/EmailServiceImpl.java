package com.medcore.features.notification.service.impl;

import com.medcore.features.notification.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    public void sendHospitalAdminCredentials(
            String email,
            String fullName,
            String temporaryPassword,
            String hospitalName) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(email);
        message.setSubject(
                "Your MedCore Hospital Admin Account"
        );

        message.setText("""
                Welcome to MedCore

                Hello %s,

                You have been appointed as a Hospital Administrator
                for %s.

                Your login credentials are:

                Email: %s
                Temporary Password: %s

                Please log in to MedCore and change your password
                after your first login.

                Regards,
                MedCore Team
                """.formatted(
                fullName,
                hospitalName,
                email,
                temporaryPassword
        ));

        mailSender.send(message);
    }
    
    @Override
    public void sendDoctorCredentials(
            String email,
            String fullName,
            String temporaryPassword,
            String hospitalName) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(email);

        message.setSubject(
                "Welcome to MedCore - Doctor Account Created"
        );

        message.setText("""
                Welcome to MedCore

                Dear Dr. %s,

                Your doctor account has been successfully created
                by the administration of %s.

                You can now access the MedCore Hospital Management
                System using the credentials below.

                Login Email: %s
                Temporary Password: %s

                Please log in using these credentials and change
                your temporary password after your first login.

                We are pleased to welcome you to the MedCore platform.

                Regards,
                MedCore Team
                """.formatted(
                fullName,
                hospitalName,
                email,
                temporaryPassword
        ));

        mailSender.send(message);
    }
    
    @Override
    public void sendNurseCredentials(
            String email,
            String fullName,
            String temporaryPassword,
            String hospitalName) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(email);

        message.setSubject(
                "Welcome to MedCore - Nurse Account Created"
        );

        message.setText("""
                Welcome to MedCore

                Dear %s,

                Your nurse account has been successfully created
                by the administration of %s.

                You can now access the MedCore Hospital Management
                System using the credentials below.

                Login Email: %s
                Temporary Password: %s

                Please log in using these credentials and change
                your temporary password after your first login.

                We are pleased to welcome you to the MedCore platform.

                Regards,
                MedCore Team
                """.formatted(
                fullName,
                hospitalName,
                email,
                temporaryPassword
        ));

        mailSender.send(message);
    }
    
    @Override
    public void sendAccountantCredentials(
            String email,
            String fullName,
            String temporaryPassword,
            String hospitalName) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(email);

        message.setSubject(
                "Welcome to MedCore - Accountant Account Created"
        );

        message.setText("""
                Welcome to MedCore

                Dear %s,

                Your accountant account has been successfully created
                by the administration of %s.

                You can now access the MedCore Hospital Management
                System using the credentials below.

                Login Email: %s
                Temporary Password: %s

                Please log in using these credentials and change
                your temporary password after your first login.

                We are pleased to welcome you to the MedCore platform.

                Regards,
                MedCore Team
                """.formatted(
                fullName,
                hospitalName,
                email,
                temporaryPassword
        ));

        mailSender.send(message);
    }
}