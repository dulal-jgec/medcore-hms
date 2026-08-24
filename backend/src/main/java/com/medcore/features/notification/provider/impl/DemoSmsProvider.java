package com.medcore.features.notification.provider.impl;

import com.medcore.features.notification.provider.NotificationDeliveryResult;
import com.medcore.features.notification.provider.SmsProvider;

import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Component;

@Component
@Slf4j
public class DemoSmsProvider implements SmsProvider {

    @Override
    public NotificationDeliveryResult sendSms(
            String phoneNumber,
            String message) {

        log.info(
                "DEMO SMS → To: {} | Message: {}",
                phoneNumber,
                message
        );

        return NotificationDeliveryResult.builder()
                .success(true)
                .build();
    }
}