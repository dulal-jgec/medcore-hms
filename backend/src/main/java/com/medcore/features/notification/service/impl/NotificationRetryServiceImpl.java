package com.medcore.features.notification.service.impl;

import com.medcore.features.notification.channel.EmailNotificationChannel;
import com.medcore.features.notification.entity.NotificationDelivery;
import com.medcore.features.notification.enums.DeliveryStatus;
import com.medcore.features.notification.repository.NotificationDeliveryRepository;
import com.medcore.features.notification.service.NotificationRetryService;
import org.springframework.scheduling.annotation.Scheduled;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationRetryServiceImpl
        implements NotificationRetryService {

    private final NotificationDeliveryRepository
            notificationDeliveryRepository;

    private final EmailNotificationChannel
            emailNotificationChannel;
    

    @Override
    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void retryFailedEmails() {

        List<NotificationDelivery> failedDeliveries =
                notificationDeliveryRepository
                        .findByStatusAndRetryCountLessThan(
                                DeliveryStatus.FAILED,
                                3
                        );

        for (NotificationDelivery delivery :
                failedDeliveries) {

            try {

                emailNotificationChannel.send(
                        delivery.getNotification().getRecipient(),
                        delivery.getNotification().getTitle(),
                        delivery.getNotification().getMessage()
                );

                delivery.setStatus(
                        DeliveryStatus.SENT
                );

                delivery.setErrorMessage(null);

            } catch (Exception e) {

                delivery.setRetryCount(
                        delivery.getRetryCount() + 1
                );

                delivery.setErrorMessage(
                        e.getMessage()
                );
            }

            notificationDeliveryRepository.save(
                    delivery
            );
        }
    }
}