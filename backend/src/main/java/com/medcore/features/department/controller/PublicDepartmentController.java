package com.medcore.features.department.controller;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.department.dto.response.PublicDepartmentResponse;
import com.medcore.features.department.service.PublicDepartmentService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public/hospitals/{hospitalId}/departments")
@RequiredArgsConstructor
public class PublicDepartmentController {

    private final PublicDepartmentService publicDepartmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PublicDepartmentResponse>>>
    getDepartments(
            @PathVariable Long hospitalId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        return ResponseEntity.ok(
                publicDepartmentService.getDepartments(
                        hospitalId,
                        page,
                        size,
                        sortBy,
                        sortDir
                )
        );
    }

    @GetMapping("/{departmentId}")
    public ResponseEntity<ApiResponse<PublicDepartmentResponse>>
    getDepartment(
            @PathVariable Long hospitalId,
            @PathVariable Long departmentId) {

        return ResponseEntity.ok(
                publicDepartmentService.getDepartment(
                        hospitalId,
                        departmentId
                )
        );
    }
}