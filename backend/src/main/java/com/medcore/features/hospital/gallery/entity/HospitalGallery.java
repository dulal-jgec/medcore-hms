package com.medcore.features.hospital.gallery.entity;

import com.medcore.features.hospital.entity.Hospital;
import com.medcore.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "hospital_gallery",
    indexes = {
        @Index(name = "idx_hospital_gallery_hospital_id", columnList = "hospital_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HospitalGallery extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private GalleryCategory category;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false, length = 500)
    private String imageUrl;

    @Column(nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private GalleryStatus status = GalleryStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "hospital_id",
        nullable = false
    )
    private Hospital hospital;
}