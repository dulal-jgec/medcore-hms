package com.medcore.features.hospital.gallery.mapper;

import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.gallery.dto.CreateGalleryImageRequest;
import com.medcore.features.hospital.gallery.dto.GalleryImageResponse;
import com.medcore.features.hospital.gallery.dto.UpdateGalleryImageRequest;
import com.medcore.features.hospital.gallery.entity.HospitalGallery;
import org.springframework.stereotype.Component;

@Component
public class HospitalGalleryMapper {

    public HospitalGallery toEntity(
            CreateGalleryImageRequest request,
            Hospital hospital,
            String imageUrl
    ) {
        return HospitalGallery.builder()
                .title(request.getTitle().trim())
                .category(request.getCategory())
                .description(
                        request.getDescription() != null
                                ? request.getDescription().trim()
                                : null
                )
                .imageUrl(imageUrl)
                .displayOrder(
                        request.getDisplayOrder() != null
                                ? request.getDisplayOrder()
                                : 0
                )
                .hospital(hospital)
                .build();
    }

    public void updateEntity(
            HospitalGallery gallery,
            UpdateGalleryImageRequest request
    ) {
        gallery.setTitle(request.getTitle().trim());
        gallery.setCategory(request.getCategory());

        gallery.setDescription(
                request.getDescription() != null
                        ? request.getDescription().trim()
                        : null
        );

        gallery.setDisplayOrder(
                request.getDisplayOrder() != null
                        ? request.getDisplayOrder()
                        : 0
        );
    }

    public GalleryImageResponse toResponse(
            HospitalGallery gallery
    ) {
        return GalleryImageResponse.builder()
                .id(gallery.getId())
                .title(gallery.getTitle())
                .category(gallery.getCategory())
                .description(gallery.getDescription())
                .imageUrl(gallery.getImageUrl())
                .displayOrder(gallery.getDisplayOrder())
                .status(gallery.getStatus())
                .hospitalId(gallery.getHospital().getId())
                .hospitalName(gallery.getHospital().getName())
                .createdAt(gallery.getCreatedAt())
                .build();
    }
}