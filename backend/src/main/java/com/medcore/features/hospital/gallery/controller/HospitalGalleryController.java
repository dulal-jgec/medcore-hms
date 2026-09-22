package com.medcore.features.hospital.gallery.controller;

import com.medcore.common.response.ApiResponse;
import com.medcore.features.hospital.gallery.dto.CreateGalleryImageRequest;
import com.medcore.features.hospital.gallery.dto.GalleryImageResponse;
import com.medcore.features.hospital.gallery.dto.UpdateGalleryImageRequest;
import com.medcore.features.hospital.gallery.entity.GalleryCategory;
import com.medcore.features.hospital.gallery.service.HospitalGalleryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/hospital/gallery")
@RequiredArgsConstructor
@PreAuthorize("hasRole('HOSPITAL_ADMIN')")
public class HospitalGalleryController {

    private final HospitalGalleryService hospitalGalleryService;

    @PostMapping(consumes = "multipart/form-data")
public ResponseEntity<ApiResponse<GalleryImageResponse>> create(

        @RequestParam("file")
        MultipartFile file,

        @RequestParam("title")
        String title,

        @RequestParam("category")
        GalleryCategory category,

        @RequestParam(required = false)
        String description,

        @RequestParam(defaultValue = "0")
        Integer displayOrder
) {

    CreateGalleryImageRequest request =
            new CreateGalleryImageRequest();

    request.setTitle(title);
    request.setCategory(category);
    request.setDescription(description);
    request.setDisplayOrder(displayOrder);

    return ResponseEntity.ok(
            hospitalGalleryService.create(
                    request,
                    file
            )
    );
}

    @GetMapping
    public ResponseEntity<ApiResponse<Page<GalleryImageResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,

            @RequestParam(defaultValue = "20") int size
    ) {

        return ResponseEntity.ok(
                hospitalGalleryService.getAll(
                        page,
                        size
                )
        );
    }

    @GetMapping("/{galleryId}")
    public ResponseEntity<ApiResponse<GalleryImageResponse>> getById(
            @PathVariable Long galleryId
    ) {

        return ResponseEntity.ok(
                hospitalGalleryService.getById(
                        galleryId
                )
        );
    }

    @PutMapping("/{galleryId}")
    public ResponseEntity<ApiResponse<GalleryImageResponse>> update(
            @PathVariable Long galleryId,

            @Valid @RequestBody
            UpdateGalleryImageRequest request
    ) {

        return ResponseEntity.ok(
                hospitalGalleryService.update(
                        galleryId,
                        request
                )
        );
    }

    @PostMapping(
            value = "/{galleryId}/image",
            consumes = "multipart/form-data"
    )
    public ResponseEntity<ApiResponse<GalleryImageResponse>>
    replaceImage(
            @PathVariable Long galleryId,

            @RequestParam("file")
            MultipartFile file
    ) {

        return ResponseEntity.ok(
                hospitalGalleryService.replaceImage(
                        galleryId,
                        file
                )
        );
    }

    @DeleteMapping("/{galleryId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long galleryId
    ) {

        return ResponseEntity.ok(
                hospitalGalleryService.delete(
                        galleryId
                )
        );
    }
}