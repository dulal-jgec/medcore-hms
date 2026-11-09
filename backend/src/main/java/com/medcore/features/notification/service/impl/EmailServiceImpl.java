package com.medcore.features.notification.service.impl;

import com.medcore.features.notification.service.EmailService;
import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    @Value("${sendgrid.api-key}")
    private String sendgridApiKey;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Override
    public void send(String recipient, String subject, String body) {
        Email from = new Email(fromEmail);
        Email to = new Email(recipient);
        Content content = new Content("text/plain", body);
        Mail mail = new Mail(from, subject, to, content);

        SendGrid sg = new SendGrid(sendgridApiKey);
        Request request = new Request();
        
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sg.api(request);

            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                log.info("Email sent successfully via SendGrid API. Status Code: {}", response.getStatusCode());
            } else {
                log.error("Failed to send email via SendGrid API. Status Code: {}, Body: {}", response.getStatusCode(), response.getBody());
                throw new RuntimeException("Failed to send email via SendGrid API");
            }
        } catch (IOException ex) {
            log.error("IOException while sending email via SendGrid API", ex);
            throw new RuntimeException("Failed to send email via SendGrid API", ex);
        }
    }

    @Override
    public void sendHospitalAdminCredentials(String email, String fullName, String temporaryPassword, String hospitalName) {
        String body = """
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
                """.formatted(fullName, hospitalName, email, temporaryPassword);

        send(email, "Your MedCore Hospital Admin Account", body);
    }

    @Override
    public void sendDoctorCredentials(String email, String fullName, String temporaryPassword, String hospitalName) {
        String body = """
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
                """.formatted(fullName, hospitalName, email, temporaryPassword);

        send(email, "Welcome to MedCore - Doctor Account Created", body);
    }

    @Override
    public void sendNurseCredentials(String email, String fullName, String temporaryPassword, String hospitalName) {
        String body = """
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
                """.formatted(fullName, hospitalName, email, temporaryPassword);

        send(email, "Welcome to MedCore - Nurse Account Created", body);
    }

    @Override
    public void sendAccountantCredentials(String email, String fullName, String temporaryPassword, String hospitalName) {
        String body = """
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
                """.formatted(fullName, hospitalName, email, temporaryPassword);

        send(email, "Welcome to MedCore - Accountant Account Created", body);
    }

    @Override
    public void sendReceptionistCredentials(String email, String fullName, String temporaryPassword, String hospitalName) {
        String body = """
                Welcome to MedCore

                Dear %s,

                Your receptionist account has been successfully created
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
                """.formatted(fullName, hospitalName, email, temporaryPassword);

        send(email, "Welcome to MedCore - Receptionist Account Created", body);
    }
}