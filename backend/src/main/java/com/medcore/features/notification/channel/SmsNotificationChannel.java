package com.medcore.features.notification.channel;

import com.medcore.features.notification.provider.NotificationDeliveryResult;
import com.medcore.features.user.entity.User;

public interface SmsNotificationChannel {

    NotificationDeliveryResult send(
            User recipient,
            String title,
            String message
    );
}