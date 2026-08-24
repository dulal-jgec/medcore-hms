package com.medcore.features.notification.provider;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NotificationDeliveryResult {

    private boolean success;

    private String errorMessage;
}