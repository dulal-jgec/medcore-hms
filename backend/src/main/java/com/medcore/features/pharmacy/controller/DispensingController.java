package com.medcore.features.pharmacy.controller;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.pharmacy.entity.DispensingRequest;
import com.medcore.features.pharmacy.service.DispensingService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/pharmacy/dispensing")
@RequiredArgsConstructor
public class DispensingController {

    private final DispensingService dispensingService;

    @PatchMapping("/{dispensingRequestId}/dispense")
    public ApiResponse<DispensingRequest> dispensePrescription(
            @PathVariable Long dispensingRequestId) {

        return dispensingService.dispensePrescription(
                dispensingRequestId
        );
    }
}