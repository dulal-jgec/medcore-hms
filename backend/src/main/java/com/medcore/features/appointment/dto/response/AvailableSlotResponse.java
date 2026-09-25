package com.medcore.features.appointment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class AvailableSlotResponse {

    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean available;
}