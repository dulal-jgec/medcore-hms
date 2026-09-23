package com.medcore.features.doctor.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
@AllArgsConstructor
public class PublicDoctorResponse {

    private Long id;

    private String doctorName;

    private String profileImageUrl;

    private Long hospitalId;

    private String hospitalName;

    private Long departmentId;

    private String departmentName;

    private String specialization;

    private Integer experienceYears;

    private BigDecimal consultationFee;

    private Integer consultationDurationMinutes;

    private String qualification;

    private String bio;

    private String languages;
}