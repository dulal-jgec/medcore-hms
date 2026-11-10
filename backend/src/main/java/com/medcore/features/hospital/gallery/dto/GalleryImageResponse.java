package com.medcore.features.hospital.gallery.dto;

import com.medcore.features.hospital.gallery.entity.GalleryCategory;
import com.medcore.features.hospital.gallery.entity.GalleryStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GalleryImageResponse {

    private Long id;
    private String title;
    private GalleryCategory category;
    private String description;
    private String imageUrl;
    private Integer displayOrder;
    private GalleryStatus status;
    private Long hospitalId;
    private String hospitalName;
    private LocalDateTime createdAt;
}