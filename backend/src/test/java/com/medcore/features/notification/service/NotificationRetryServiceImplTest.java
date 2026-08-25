package com.medcore.features.notification.service;

import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.notification.channel.EmailNotificationChannel;
import com.medcore.features.notification.entity.Notification;
import com.medcore.features.notification.entity.NotificationDelivery;
import com.medcore.features.notification.enums.DeliveryStatus;
import com.medcore.features.notification.repository.NotificationDeliveryRepository;
import com.medcore.features.notification.service.impl.NotificationRetryServiceImpl;
import com.medcore.features.user.entity.User;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class NotificationRetryServiceImplTest {

    @Mock
    private NotificationDeliveryRepository
            notificationDeliveryRepository;

    @Mock
    private EmailNotificationChannel
            emailNotificationChannel;

    @InjectMocks
    private NotificationRetryServiceImpl
            notificationRetryService;

    @BeforeEach
    void setUp() {

        MockitoAnnotations.openMocks(this);
    }

    @Test
    void retryFailedEmails_shouldMarkDeliveryAsSentWhenEmailSucceeds() {

        User user = new User();
        user.setEmail("test@gmail.com");

        Notification notification =
                Notification.builder()
                        .recipient(user)
                        .title("Test Email")
                        .message("Hello")
                        .build();

        NotificationDelivery delivery =
                NotificationDelivery.builder()
                        .notification(notification)
                        .status(DeliveryStatus.FAILED)
                        .retryCount(0)
                        .errorMessage("Previous failure")
                        .build();

        when(
                notificationDeliveryRepository
                        .findByStatusAndRetryCountLessThan(
                                DeliveryStatus.FAILED,
                                3
                        )
        ).thenReturn(
                List.of(delivery)
        );

        doNothing()
                .when(emailNotificationChannel)
                .send(
                        user,
                        "Test Email",
                        "Hello"
                );

        notificationRetryService.retryFailedEmails();

        assertEquals(
                DeliveryStatus.SENT,
                delivery.getStatus()
        );

        assertEquals(
                0,
                delivery.getRetryCount()
        );

        assertNull(
                delivery.getErrorMessage()
        );

        verify(emailNotificationChannel)
                .send(
                        user,
                        "Test Email",
                        "Hello"
                );

        verify(notificationDeliveryRepository)
                .save(delivery);
    }

    @Test
    void retryFailedEmails_shouldIncrementRetryCountWhenEmailFails() {

        User user = new User();
        user.setEmail("test@gmail.com");

        Notification notification =
                Notification.builder()
                        .recipient(user)
                        .title("Test Email")
                        .message("Hello")
                        .build();

        NotificationDelivery delivery =
                NotificationDelivery.builder()
                        .notification(notification)
                        .status(DeliveryStatus.FAILED)
                        .retryCount(0)
                        .errorMessage("Previous failure")
                        .build();

        when(
                notificationDeliveryRepository
                        .findByStatusAndRetryCountLessThan(
                                DeliveryStatus.FAILED,
                                3
                        )
        ).thenReturn(
                List.of(delivery)
        );

        doThrow(
                new RuntimeException(
                        "Email service unavailable"
                )
        )
        .when(emailNotificationChannel)
        .send(
                user,
                "Test Email",
                "Hello"
        );

        notificationRetryService.retryFailedEmails();

        assertEquals(
                DeliveryStatus.FAILED,
                delivery.getStatus()
        );

        assertEquals(
                1,
                delivery.getRetryCount()
        );

        assertEquals(
                "Email service unavailable",
                delivery.getErrorMessage()
        );

        verify(emailNotificationChannel)
                .send(
                        user,
                        "Test Email",
                        "Hello"
                );

        verify(notificationDeliveryRepository)
                .save(delivery);
    }

    @Test
    void retryFailedEmails_shouldDoNothingWhenNoFailedDeliveriesExist() {

        when(
                notificationDeliveryRepository
                        .findByStatusAndRetryCountLessThan(
                                DeliveryStatus.FAILED,
                                3
                        )
        ).thenReturn(
                List.of()
        );

        notificationRetryService.retryFailedEmails();

        verify(
                emailNotificationChannel,
                never()
        ).send(
                any(),
                anyString(),
                anyString()
        );

        verify(
                notificationDeliveryRepository,
                never()
        ).save(any());
    }
}