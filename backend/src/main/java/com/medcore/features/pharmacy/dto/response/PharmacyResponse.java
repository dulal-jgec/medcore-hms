package com.medcore.features.pharmacy.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PharmacyResponse {

    private Long id;

    private String name;

    private String address;

    private String phone;

    private Boolean active;

    private Long hospitalId;
}