package com.medcore.features.notification.controller;

import com.medcore.common.response.ApiResponse;

import com.medcore.features.notification.dto.response.NotificationResponse;
import com.medcore.features.notification.service.NotificationService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;

import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;


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
}