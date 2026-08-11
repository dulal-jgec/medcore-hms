package com.medcore.features.superadmin.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SuperAdminDashboardResponse {

    private long totalHospitals;

    private long activeHospitals;

    private long inactiveHospitals;

    private long deletedHospitals;
}