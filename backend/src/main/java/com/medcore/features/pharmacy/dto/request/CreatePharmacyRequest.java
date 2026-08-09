package com.medcore.features.pharmacy.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatePharmacyRequest {

    @NotBlank
    @Size(max = 150)
    private String name;

    @Size(max = 255)
    private String address;

    @Size(max = 20)
    private String phone;
}