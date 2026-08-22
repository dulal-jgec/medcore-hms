package com.medcore.features.notification.service;

import com.medcore.features.notification.dto.response.NotificationResponse;
import com.medcore.features.notification.enums.NotificationType;

import org.springframework.data.domain.Page;

public interface NotificationService {

    void sendNotification(
            Long recipientUserId,
            NotificationType type,
            String title,
            String message
    );

    Page<NotificationResponse> getMyNotifications(
            int page,
            int size
    );
    void markAsRead(Long notificationId);
    long getUnreadCount();
}