package com.medcore.features.department.mapper;

import com.medcore.features.department.dto.request.CreateDepartmentRequest;
import com.medcore.features.department.dto.request.UpdateDepartmentRequest;
import com.medcore.features.department.dto.response.DepartmentResponse;
import com.medcore.features.department.entity.Department;
import com.medcore.features.department.enums.DepartmentStatus;
import com.medcore.features.hospital.entity.Hospital;
import org.springframework.stereotype.Component;

@Component
public class DepartmentMapper {

    public Department toEntity(CreateDepartmentRequest request, Hospital hospital) {

        return Department.builder()
                .name(request.getName().trim())
                .code(request.getCode().trim().toUpperCase())
                .description(request.getDescription())
                .hospital(hospital)
                .status(DepartmentStatus.ACTIVE)
                .build();
    }

    public DepartmentResponse toResponse(Department department) {

        return DepartmentResponse.builder()
                .id(department.getId())
                .name(department.getName())
                .code(department.getCode())
                .description(department.getDescription())
                .hospitalId(department.getHospital().getId())
                .hospitalName(department.getHospital().getName())
                .status(department.getStatus())
                .createdAt(department.getCreatedAt())
                .build();
    }
    
    public void updateEntity(
            Department department,
            UpdateDepartmentRequest request) {

        department.setName(request.getName().trim());
        department.setCode(request.getCode().trim().toUpperCase());
        department.setDescription(request.getDescription());
    }
}