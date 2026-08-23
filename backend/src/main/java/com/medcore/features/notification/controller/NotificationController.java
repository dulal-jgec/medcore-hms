package com.medcore.features.notification.controller;

import com.medcore.common.response.ApiResponse;

import com.medcore.features.notification.dto.response.NotificationResponse;
import com.medcore.features.notification.service.NotificationService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;

import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;
import com.medcore.common.security.SecurityUtil;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.features.user.entity.User;
import com.medcore.features.user.repository.UserRepository;
import com.medcore.features.notification.channel.EmailNotificationChannel;
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final EmailNotificationChannel emailNotificationChannel;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<
            ApiResponse<Page<NotificationResponse>>
            >
    getMyNotifications(

            @RequestParam(
                    defaultValue = "0"
            )
            int page,

            @RequestParam(
                    defaultValue = "10"
            )
            int size) {

        Page<NotificationResponse> notifications =
                notificationService
                        .getMyNotifications(
                                page,
                                size
                        );

        return ResponseEntity.ok(
                ApiResponse
                        .<Page<NotificationResponse>>
                        builder()
                        .success(true)
                        .message(
                                "Notifications fetched successfully"
                        )
                        .data(
                                notifications
                        )
                        .build()
        );
    }
    
    @PatchMapping("/{notificationId}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>>
    markAsRead(
            @PathVariable Long notificationId) {

        notificationService.markAsRead(notificationId);

        return ResponseEntity.ok(
                ApiResponse
                        .<String>builder()
                        .success(true)
                        .message(
                                "Notification marked as read"
                        )
                        .data("Read")
                        .build()
        );
    }
    
    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Long>>
    getUnreadCount() {

        long count =
                notificationService.getUnreadCount();

        return ResponseEntity.ok(
                ApiResponse
                        .<Long>builder()
                        .success(true)
                        .message(
                                "Unread notification count fetched successfully"
                        )
                        .data(count)
                        .build()
        );
    }
    
    @PostMapping("/test-email")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> testEmail() {

        String email =
                SecurityUtil.getCurrentUsername();

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Current user not found"
                                ));

        emailNotificationChannel.send(
                user,
                "MedCore Test Email",
                "This is a test email from MedCore HMS."
        );

        return ResponseEntity.ok(
                ApiResponse
                        .<String>builder()
                        .success(true)
                        .message("Test email sent successfully")
                        .data("Email sent")
                        .build()
        );
    }
}