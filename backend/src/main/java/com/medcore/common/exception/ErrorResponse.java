package com.medcore.common.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class ErrorResponse {

    private boolean success;

    private String errorCode;

    private String message;

    private LocalDateTime timestamp;

}