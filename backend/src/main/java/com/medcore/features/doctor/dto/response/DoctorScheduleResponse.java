package com.medcore.features.doctor.dto.response;

import com.medcore.features.doctor.enums.DayOfWeek;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class DoctorScheduleResponse {

    private Long id;

    private Long doctorId;

    private String doctorName;

    private DayOfWeek dayOfWeek;

    private LocalTime startTime;

    private LocalTime endTime;

    private Boolean available;
}