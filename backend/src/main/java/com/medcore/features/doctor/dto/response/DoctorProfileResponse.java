package com.medcore.features.doctor.dto.response;

import com.medcore.features.doctor.enums.DoctorStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class DoctorProfileResponse {

    private Long id;

    private Long userId;

    private String doctorName;

    private String email;

    private String phone;

    private String profileImageUrl;

    private String bio;

    private String languages;

    private Long hospitalId;

    private String hospitalName;

    private Long departmentId;

    private String departmentName;

    private String specialization;

    private Integer experienceYears;

    private BigDecimal consultationFee;

    private String qualification;

    private DoctorStatus status;

    private LocalDateTime createdAt;
}