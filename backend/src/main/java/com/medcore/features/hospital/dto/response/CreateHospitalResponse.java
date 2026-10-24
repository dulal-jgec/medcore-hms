
package com.medcore.features.hospital.dto.response;

import com.medcore.features.hospital.enums.HospitalStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
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

    private String state;
    private String address;
    private String pincode;
    private String emergencyPhone;
    private String description;
}
