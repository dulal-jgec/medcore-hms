package com.medcore.features.notification.service;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.security.TenantContextService;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.notification.channel.EmailNotificationChannel;
import com.medcore.features.notification.channel.SmsNotificationChannel;
import com.medcore.features.notification.entity.Notification;
import com.medcore.features.notification.entity.NotificationDelivery;
import com.medcore.features.notification.enums.NotificationType;
import com.medcore.features.notification.provider.NotificationDeliveryResult;
import com.medcore.features.notification.repository.NotificationDeliveryRepository;
import com.medcore.features.notification.repository.NotificationRepository;
import com.medcore.features.notification.service.impl.NotificationServiceImpl;
import com.medcore.features.user.entity.User;
import com.medcore.features.user.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.junit.jupiter.api.AfterEach;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;
import java.util.Optional;
import com.medcore.common.security.SecurityUtil;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class NotificationServiceImplTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private NotificationDeliveryRepository notificationDeliveryRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TenantContextService tenantContextService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private EmailNotificationChannel emailNotificationChannel;

    @Mock
    private SmsNotificationChannel smsNotificationChannel;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private MockedStatic<SecurityUtil> securityUtilMock;
    
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        securityUtilMock =
                Mockito.mockStatic(SecurityUtil.class);

        securityUtilMock
                .when(SecurityUtil::getCurrentUsername)
                .thenReturn("test@gmail.com");
    }
    
    @AfterEach
    void tearDown() {
        securityUtilMock.close();
    }

    @Test
    void sendNotification_shouldSendEmailSuccessfully() {

        Long hospitalId = 1L;
        Long userId = 10L;

        Hospital hospital = new Hospital();
        hospital.setId(hospitalId);

        User user = new User();
        user.setId(userId);
        user.setEmail("test@gmail.com");
        user.setHospital(hospital);

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(hospitalId);

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(user));

        Notification notification =
                Notification.builder()
                        .recipient(user)
                        .hospital(hospital)
                        .type(NotificationType.GENERAL)
                        .title("Test")
                        .message("Hello")
                        .build();

        when(notificationRepository.save(any(Notification.class)))
                .thenReturn(notification);

        doNothing()
                .when(emailNotificationChannel)
                .send(any(User.class), anyString(), anyString());

        NotificationDeliveryResult smsResult =
                mock(NotificationDeliveryResult.class);

        when(smsResult.isSuccess())
                .thenReturn(true);

        when(smsResult.getErrorMessage())
                .thenReturn(null);

        when(smsNotificationChannel.send(
                any(User.class),
                anyString(),
                anyString()
        )).thenReturn(smsResult);

        notificationService.sendNotification(
                userId,
                NotificationType.GENERAL,
                "Test",
                "Hello"
        );

        verify(notificationRepository)
                .save(any(Notification.class));

        verify(emailNotificationChannel)
                .send(
                        user,
                        "Test",
                        "Hello"
                );

        verify(notificationDeliveryRepository, times(2))
                .save(any(NotificationDelivery.class));

        verify(messagingTemplate)
                .convertAndSendToUser(
                        eq(userId.toString()),
                        eq("/queue/notifications"),
                        any()
                );
    }

    @Test
    void sendNotification_shouldRejectDifferentHospitalUser() {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        Hospital otherHospital = new Hospital();
        otherHospital.setId(2L);

        User user = new User();
        user.setId(10L);
        user.setHospital(otherHospital);

        when(userRepository.findById(10L))
                .thenReturn(Optional.of(user));

        assertThrows(
                BusinessException.class,
                () -> notificationService.sendNotification(
                        10L,
                        NotificationType.GENERAL,
                        "Test",
                        "Hello"
                )
        );

        verify(notificationRepository, never())
                .save(any());

        verify(emailNotificationChannel, never())
                .send(any(), anyString(), anyString());
    }

    @Test
    void sendNotification_shouldFailWhenHospitalContextMissing() {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(null);

        assertThrows(
                BusinessException.class,
                () -> notificationService.sendNotification(
                        10L,
                        NotificationType.GENERAL,
                        "Test",
                        "Hello"
                )
        );

        verify(userRepository, never())
                .findById(anyLong());
    }

    @Test
    void sendNotification_shouldThrowWhenRecipientNotFound() {

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        when(userRepository.findById(10L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> notificationService.sendNotification(
                        10L,
                        NotificationType.GENERAL,
                        "Test",
                        "Hello"
                )
        );
    }

    @Test
void getUnreadCount_shouldReturnCount() {

    Long hospitalId = 1L;

    Hospital hospital = new Hospital();
    hospital.setId(hospitalId);

    User user = new User();
    user.setId(10L);
    user.setEmail("test@gmail.com");
    user.setHospital(hospital);

    when(tenantContextService.getCurrentHospitalId())
            .thenReturn(hospitalId);

    mockCurrentUser(user);

    when(
            notificationRepository
                    .countByHospitalIdAndRecipientIdAndReadFalseAndDeletedAtIsNull(
                            hospitalId,
                            user.getId()
                    )
    ).thenReturn(5L);

    long result =
            notificationService.getUnreadCount();

    assertEquals(5L, result);
}

    @Test
    void getMyNotifications_shouldReturnNotifications() {

        Long hospitalId = 1L;

        Hospital hospital = new Hospital();
        hospital.setId(hospitalId);

        User user = new User();
        user.setId(10L);
        user.setEmail("test@gmail.com");
        user.setHospital(hospital);

        Notification notification =
                Notification.builder()
                        .recipient(user)
                        .hospital(hospital)
                        .type(NotificationType.GENERAL)
                        .title("Test")
                        .message("Hello")
                        .build();

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(hospitalId);

        mockCurrentUser(user);

        Page<Notification> page =
                new PageImpl<>(
                        List.of(notification)
                );

        when(
                notificationRepository
                        .findByHospitalIdAndRecipientIdAndDeletedAtIsNull(
                                eq(hospitalId),
                                eq(user.getId()),
                                any(Pageable.class)
                        )
        ).thenReturn(page);

        Page<?> result =
                notificationService.getMyNotifications(
                        0,
                        10
                );

        assertEquals(1, result.getTotalElements());
    }

    private void mockCurrentUser(User user) {

        when(userRepository.findByEmail(
                "test@gmail.com"
        )).thenReturn(Optional.of(user));
    }
}