package com.medcore.features.receptionist.dto.response;

import com.medcore.features.receptionist.enums.ReceptionistStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReceptionistResponse {

    private Long id;

    private Long userId;

    private String name;

    private String email;

    private Long hospitalId;

    private String designation;

    private ReceptionistStatus status;
}