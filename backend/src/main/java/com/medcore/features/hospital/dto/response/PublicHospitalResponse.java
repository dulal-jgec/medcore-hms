package com.medcore.features.hospital.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class PublicHospitalResponse {

    private Long id;

    private String name;

    private String email;

    private String phone;

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