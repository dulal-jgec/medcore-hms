package com.medcore.features.notification.dto.response;

import com.medcore.features.notification.enums.NotificationType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class NotificationResponse {

    private Long id;

    private NotificationType type;

    private String title;

    private String message;

    private Boolean read;

    private LocalDateTime createdAt;
}