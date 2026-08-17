package com.medcore.features.department.controller;

import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.PageResponse;
import com.medcore.features.department.dto.request.CreateDepartmentRequest;
import com.medcore.features.department.dto.request.UpdateDepartmentRequest;
import com.medcore.features.department.dto.request.UpdateDepartmentStatusRequest;
import com.medcore.features.department.dto.response.DepartmentResponse;
import com.medcore.features.department.service.DepartmentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/departments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('HOSPITAL_ADMIN')")
public class DepartmentController {

    private final DepartmentService departmentService;


    @PostMapping
    public ResponseEntity<ApiResponse<DepartmentResponse>>
    createDepartment(
            @Valid @RequestBody CreateDepartmentRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        departmentService.createDepartment(
                                request
                        )
                );
    }


    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<DepartmentResponse>>>
    getAllDepartments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        return ResponseEntity.ok(
                departmentService.getAllDepartments(
                        page,
                        size,
                        sortBy,
                        sortDir
                )
        );
    }


    @GetMapping("/{departmentId}")
    public ResponseEntity<ApiResponse<DepartmentResponse>>
    getDepartmentById(
            @PathVariable Long departmentId) {

        return ResponseEntity.ok(
                departmentService.getDepartmentById(
                        departmentId
                )
        );
    }


    @PutMapping("/{departmentId}")
    public ResponseEntity<ApiResponse<DepartmentResponse>>
    updateDepartment(
            @PathVariable Long departmentId,
            @Valid @RequestBody UpdateDepartmentRequest request) {

        return ResponseEntity.ok(
                departmentService.updateDepartment(
                        departmentId,
                        request
                )
        );
    }


    @PatchMapping("/{departmentId}/status")
    public ResponseEntity<ApiResponse<DepartmentResponse>>
    updateDepartmentStatus(
            @PathVariable Long departmentId,
            @Valid @RequestBody UpdateDepartmentStatusRequest request) {

        return ResponseEntity.ok(
                departmentService.updateDepartmentStatus(
                        departmentId,
                        request
                )
        );
    }


    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PageResponse<DepartmentResponse>>>
    searchDepartments(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(
                departmentService.searchDepartments(
                        keyword,
                        page,
                        size
                )
        );
    }


    @DeleteMapping("/{departmentId}")
    public ResponseEntity<ApiResponse<String>>
    deleteDepartment(
            @PathVariable Long departmentId) {

        return ResponseEntity.ok(
                departmentService.deleteDepartment(
                        departmentId
                )
        );
    }


    @PatchMapping("/{departmentId}/restore")
    public ResponseEntity<ApiResponse<String>>
    restoreDepartment(
            @PathVariable Long departmentId) {

        return ResponseEntity.ok(
                departmentService.restoreDepartment(
                        departmentId
                )
        );
    }
}