package com.medcore.features.notification.channel;

import com.medcore.features.user.entity.User;

public interface NotificationChannelService {

    void send(
            User recipient,
            String title,
            String message
    );
}