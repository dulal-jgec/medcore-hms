package com.medcore.features.hospital.gallery.service;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.hospital.gallery.dto.GalleryImageResponse;
import com.medcore.features.hospital.gallery.entity.GalleryCategory;

import org.springframework.data.domain.Page;

public interface PublicHospitalGalleryService {

    ApiResponse<Page<GalleryImageResponse>> getGallery(
            Long hospitalId,
            int page,
            int size,
            String sortBy,
            String sortDir
    );

    ApiResponse<Page<GalleryImageResponse>> getGalleryByCategory(
            Long hospitalId,
            GalleryCategory category,
            int page,
            int size,
            String sortBy,
            String sortDir
    );

    ApiResponse<GalleryImageResponse> getGalleryImage(
            Long hospitalId,
            Long galleryId
    );
}