package com.medcore.features.nurse.controller;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.nurse.dto.request.CreateNurseRequest;
import com.medcore.features.nurse.dto.request.UpdateNurseRequest;
import com.medcore.features.nurse.dto.response.NurseResponse;
import com.medcore.features.nurse.service.NurseService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/nurses")
@RequiredArgsConstructor
public class NurseController {

    private final NurseService nurseService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<NurseResponse> createNurse(
            @Valid @RequestBody CreateNurseRequest request) {

        return nurseService.createNurse(request);
    }

    @GetMapping("/{nurseId}")
    public ApiResponse<NurseResponse> getNurseById(
            @PathVariable Long nurseId) {

        return nurseService.getNurseById(nurseId);
    }

    @GetMapping
    public ApiResponse<List<NurseResponse>> getAllNurses() {

        return nurseService.getAllNurses();
    }

    @PutMapping("/{nurseId}")
    public ApiResponse<NurseResponse> updateNurse(
            @PathVariable Long nurseId,
            @Valid @RequestBody UpdateNurseRequest request) {

        return nurseService.updateNurse(
                nurseId,
                request
        );
    }

    @DeleteMapping("/{nurseId}")
    public ApiResponse<Void> deleteNurse(
            @PathVariable Long nurseId) {

        return nurseService.deleteNurse(nurseId);
    }

    @PatchMapping("/{nurseId}/activate")
    public ApiResponse<NurseResponse> activateNurse(
            @PathVariable Long nurseId) {

        return nurseService.activateNurse(nurseId);
    }

    @PatchMapping("/{nurseId}/deactivate")
    public ApiResponse<NurseResponse> deactivateNurse(
            @PathVariable Long nurseId) {

        return nurseService.deactivateNurse(nurseId);
    }
}