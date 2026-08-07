package com.medcore.features.doctor.repository;

import com.medcore.features.doctor.entity.DoctorSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import com.medcore.features.doctor.enums.DayOfWeek;
import java.util.List;

public interface DoctorScheduleRepository
        extends JpaRepository<DoctorSchedule, Long> {

    List<DoctorSchedule> findByDoctorIdAndDeletedAtIsNull(Long doctorId);
    
    List<DoctorSchedule> findByDoctorIdAndDayOfWeekAndDeletedAtIsNull(
            Long doctorId,
            DayOfWeek dayOfWeek
    );

}