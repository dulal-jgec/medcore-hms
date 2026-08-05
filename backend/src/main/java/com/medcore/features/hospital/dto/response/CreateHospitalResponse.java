package com.medcore.features.hospital.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import com.medcore.features.hospital.enums.HospitalStatus;
@Getter
@Setter
@Builder
@AllArgsConstructor
public class CreateHospitalResponse {

    private Long id;

    private String name;

    private String email;

    private String phone;

    private String licenseNumber;

    private String city;

    private String logo;

    private HospitalStatus status;

    private LocalDateTime createdAt;

}