package com.medcore.features.hospital.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class HospitalProfileResponse {

    private Long id;

    private String name;

    private String email;

    private String phone;

    private String licenseNumber;

    private String city;

    private String state;

    private String address;

    private String pincode;

    private String emergencyPhone;

    private String description;

    private String logoUrl;

    private String bannerUrl;

    private String website;
}