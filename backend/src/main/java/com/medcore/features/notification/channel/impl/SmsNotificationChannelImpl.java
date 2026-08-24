package com.medcore.features.notification.channel.impl;

import com.medcore.features.notification.channel.SmsNotificationChannel;
import com.medcore.features.user.entity.User;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class SmsNotificationChannelImpl
        implements SmsNotificationChannel {

    @Override
    public void send(
            User recipient,
            String title,
            String message) {

        String phoneNumber = recipient.getPhone();

        log.info(
                "Sending SMS to {} | Title: {} | Message: {}",
                phoneNumber,
                title,
                message
        );
    }
}