package com.medcore.features.hospital.entity;

import com.medcore.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "hospitals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hospital extends BaseEntity {

	@Column(nullable = false, unique = true, length = 150)
	private String name;
      

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, unique = true, length = 15)
    private String phone;

    @Column(nullable = false, unique = true)
    private String licenseNumber;

    private String logoUrl;

    private String bannerUrl;

    private String website;
    
    private String city;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}