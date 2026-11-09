package com.medcore.features.notification.channel;

import com.medcore.features.notification.service.EmailService;
import com.medcore.features.user.entity.User;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailNotificationChannel
        implements NotificationChannelService {

    private final EmailService emailService;

    @Override
    public void send(
            User recipient,
            String title,
            String message) {

        // Delegate the sending logic to the centralized EmailService
        emailService.send(
                recipient.getEmail(),
                title,
                message
        );
    }
}