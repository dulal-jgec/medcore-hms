package com.medcore.features.department.repository;

import com.medcore.features.department.entity.Department;
import com.medcore.features.department.enums.DepartmentStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PublicDepartmentRepository
        extends JpaRepository<Department, Long> {

    Page<Department> findByHospitalIdAndStatusAndDeletedAtIsNull(
            Long hospitalId,
            DepartmentStatus status,
            Pageable pageable
    );

    Optional<Department> findByIdAndHospitalIdAndStatusAndDeletedAtIsNull(
            Long departmentId,
            Long hospitalId,
            DepartmentStatus status
    );
}