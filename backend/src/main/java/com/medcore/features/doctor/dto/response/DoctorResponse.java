package com.medcore.features.doctor.dto.response;

import com.medcore.features.doctor.enums.DoctorStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class DoctorResponse {

    private Long id;

    private Long userId;

    private String doctorName;

    private String email;

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