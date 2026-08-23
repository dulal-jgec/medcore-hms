package com.medcore.features.notification.channel;

import com.medcore.features.user.entity.User;

import lombok.RequiredArgsConstructor;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailNotificationChannel
        implements NotificationChannelService {

    private final JavaMailSender mailSender;

    @Override
    public void send(
            User recipient,
            String title,
            String message) {

        SimpleMailMessage mail =
                new SimpleMailMessage();

        mail.setTo(recipient.getEmail());
        mail.setSubject(title);
        mail.setText(message);

        mailSender.send(mail);
    }
}