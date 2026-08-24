package com.medcore.features.notification.channel.impl;

import com.medcore.features.notification.channel.SmsNotificationChannel;
import com.medcore.features.notification.provider.NotificationDeliveryResult;
import com.medcore.features.notification.provider.SmsProvider;
import com.medcore.features.user.entity.User;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SmsNotificationChannelImpl
        implements SmsNotificationChannel {

    private final SmsProvider smsProvider;

    @Override
    public NotificationDeliveryResult send(
            User recipient,
            String title,
            String message) {

        return smsProvider.sendSms(
                recipient.getPhone(),
                message
        );
    }
}