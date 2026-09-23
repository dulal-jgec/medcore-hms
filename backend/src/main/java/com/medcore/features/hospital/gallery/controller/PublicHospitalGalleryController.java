package com.medcore.features.hospital.gallery.controller;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.hospital.gallery.dto.GalleryImageResponse;
import com.medcore.features.hospital.gallery.entity.GalleryCategory;
import com.medcore.features.hospital.gallery.service.PublicHospitalGalleryService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public/hospitals/{hospitalId}/gallery")
@RequiredArgsConstructor
public class PublicHospitalGalleryController {

    private final PublicHospitalGalleryService
            publicHospitalGalleryService;

    @GetMapping
    public ResponseEntity<
            ApiResponse<Page<GalleryImageResponse>>>
    getGallery(
            @PathVariable Long hospitalId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            @RequestParam(defaultValue = "displayOrder")
            String sortBy,
            @RequestParam(defaultValue = "asc")
            String sortDir) {

        return ResponseEntity.ok(
                publicHospitalGalleryService.getGallery(
                        hospitalId,
                        page,
                        size,
                        sortBy,
                        sortDir
                )
        );
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<
            ApiResponse<Page<GalleryImageResponse>>>
    getGalleryByCategory(
            @PathVariable Long hospitalId,
            @PathVariable GalleryCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            @RequestParam(defaultValue = "displayOrder")
            String sortBy,
            @RequestParam(defaultValue = "asc")
            String sortDir) {

        return ResponseEntity.ok(
                publicHospitalGalleryService
                        .getGalleryByCategory(
                                hospitalId,
                                category,
                                page,
                                size,
                                sortBy,
                                sortDir
                        )
        );
    }

    @GetMapping("/{galleryId}")
    public ResponseEntity<ApiResponse<GalleryImageResponse>>
    getGalleryImage(
            @PathVariable Long hospitalId,
            @PathVariable Long galleryId) {

        return ResponseEntity.ok(
                publicHospitalGalleryService
                        .getGalleryImage(
                                hospitalId,
                                galleryId
                        )
        );
    }
}