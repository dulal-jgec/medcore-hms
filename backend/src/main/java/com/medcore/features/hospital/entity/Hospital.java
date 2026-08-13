package com.medcore.features.hospital.entity;

import com.medcore.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.*;
import com.medcore.features.hospital.enums.HospitalStatus;
@Entity
@Table(name = "hospitals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hospital extends BaseEntity {

	@Column(nullable = false, length = 150)
	private String name;

	@Column(nullable = false, length = 100)
	private String email;

	@Column(nullable = false, length = 15)
	private String phone;

	@Column(nullable = false, length = 50)
	private String licenseNumber;

    private String logoUrl;

    private String bannerUrl;

    private String website;
    
    private String city;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HospitalStatus status;
}