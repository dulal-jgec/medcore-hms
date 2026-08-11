package com.medcore.features.lab.controller;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.lab.dto.request.CreateLabResultRequest;
import com.medcore.features.lab.dto.response.LabResultResponse;
import com.medcore.features.lab.service.LabResultService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/lab-results")
@RequiredArgsConstructor
public class LabResultController {

    private final LabResultService labResultService;


    @PostMapping("/{labOrderItemId}")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<LabResultResponse> createResult(
            @PathVariable Long labOrderItemId,
            @Valid @RequestBody CreateLabResultRequest request) {

        return labResultService.createResult(
                labOrderItemId,
                request
        );
    }


    @GetMapping("/{labOrderItemId}")
    public ApiResponse<LabResultResponse> getResult(
            @PathVariable Long labOrderItemId) {

        return labResultService.getResult(
                labOrderItemId
        );
    }
    
    @PutMapping("/{labOrderItemId}")
    public ApiResponse<LabResultResponse> updateResult(
            @PathVariable Long labOrderItemId,
            @Valid @RequestBody CreateLabResultRequest request) {

        return labResultService.updateResult(
                labOrderItemId,
                request
        );
    }
}