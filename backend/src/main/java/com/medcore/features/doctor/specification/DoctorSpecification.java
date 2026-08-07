package com.medcore.features.doctor.specification;

import com.medcore.features.department.entity.Department;
import com.medcore.features.doctor.entity.Doctor;
import com.medcore.features.doctor.enums.DoctorStatus;
import com.medcore.features.hospital.entity.Hospital;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

public class DoctorSpecification {

    private DoctorSpecification() {
    }

    public static Specification<Doctor> hasHospital(Long hospitalId) {
        return (root, query, cb) -> {

            if (hospitalId == null) {
                return cb.conjunction();
            }

            Join<Doctor, Hospital> hospitalJoin = root.join("hospital");

            return cb.equal(hospitalJoin.get("id"), hospitalId);
        };
    }

    public static Specification<Doctor> hasDepartment(Long departmentId) {
        return (root, query, cb) -> {

            if (departmentId == null) {
                return cb.conjunction();
            }

            Join<Doctor, Department> departmentJoin = root.join("department");

            return cb.equal(departmentJoin.get("id"), departmentId);
        };
    }

    public static Specification<Doctor> hasStatus(DoctorStatus status) {

        return (root, query, cb) -> {

            if (status == null) {
                return cb.conjunction();
            }

            return cb.equal(root.get("status"), status);
        };
    }
}