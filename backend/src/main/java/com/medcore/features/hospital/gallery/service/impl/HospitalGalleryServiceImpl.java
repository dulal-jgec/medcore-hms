package com.medcore.features.hospital.gallery.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.security.TenantContextService;
import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.hospital.gallery.dto.CreateGalleryImageRequest;
import com.medcore.features.hospital.gallery.dto.GalleryImageResponse;
import com.medcore.features.hospital.gallery.dto.UpdateGalleryImageRequest;
import com.medcore.features.hospital.gallery.entity.HospitalGallery;
import com.medcore.features.hospital.gallery.mapper.HospitalGalleryMapper;
import com.medcore.features.hospital.gallery.repository.HospitalGalleryRepository;
import com.medcore.features.hospital.gallery.service.HospitalGalleryService;
 import com.medcore.common.storage.FileStorageService;
import com.medcore.common.storage.FileValidationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class HospitalGalleryServiceImpl
        implements HospitalGalleryService {

    private final HospitalGalleryRepository galleryRepository;
    private final HospitalGalleryMapper galleryMapper;

    private final TenantContextService tenantContextService;

    private final FileStorageService fileStorageService;
    private final FileValidationService fileValidationService;

    @Override
    @Transactional
    public ApiResponse<GalleryImageResponse> create(
            CreateGalleryImageRequest request,
            MultipartFile file
    ) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        Hospital hospital =
                tenantContextService.getCurrentHospital();

        fileValidationService.validateImage(file);

        String imageUrl =
                fileStorageService.upload(
                        file,
                        "medcore/hospitals/"
                                + hospitalId
                                + "/gallery"
                );

        HospitalGallery gallery =
                galleryMapper.toEntity(
                        request,
                        hospital,
                        imageUrl
                );

        HospitalGallery savedGallery =
                galleryRepository.save(gallery);

        log.info(
                "Hospital gallery image created: galleryId={}, hospitalId={}",
                savedGallery.getId(),
                hospitalId
        );

        return ApiResponse
                .<GalleryImageResponse>builder()
                .success(true)
                .message("Gallery image uploaded successfully")
                .data(galleryMapper.toResponse(savedGallery))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<Page<GalleryImageResponse>> getAll(
            int page,
            int size
    ) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        Pageable pageable =
                PageRequest.of(page, size);

        Page<HospitalGallery> galleries =
                galleryRepository
                        .findByHospitalIdAndDeletedAtIsNull(
                                hospitalId,
                                pageable
                        );

        Page<GalleryImageResponse> response =
                galleries.map(galleryMapper::toResponse);

        return ApiResponse
                .<Page<GalleryImageResponse>>builder()
                .success(true)
                .message("Hospital gallery fetched successfully")
                .data(response)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<GalleryImageResponse> getById(
            Long galleryId
    ) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        HospitalGallery gallery =
                getGallery(galleryId, hospitalId);

        return ApiResponse
                .<GalleryImageResponse>builder()
                .success(true)
                .message("Gallery image fetched successfully")
                .data(galleryMapper.toResponse(gallery))
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<GalleryImageResponse> update(
            Long galleryId,
            UpdateGalleryImageRequest request
    ) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        HospitalGallery gallery =
                getGallery(galleryId, hospitalId);

        galleryMapper.updateEntity(
                gallery,
                request
        );

        HospitalGallery updatedGallery =
                galleryRepository.save(gallery);

        return ApiResponse
                .<GalleryImageResponse>builder()
                .success(true)
                .message("Gallery image updated successfully")
                .data(galleryMapper.toResponse(updatedGallery))
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<GalleryImageResponse> replaceImage(
            Long galleryId,
            MultipartFile file
    ) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        HospitalGallery gallery =
                getGallery(galleryId, hospitalId);

        fileValidationService.validateImage(file);

        String imageUrl =
                fileStorageService.upload(
                        file,
                        "medcore/hospitals/"
                                + hospitalId
                                + "/gallery"
                );

        gallery.setImageUrl(imageUrl);

        HospitalGallery updatedGallery =
                galleryRepository.save(gallery);

        log.info(
                "Hospital gallery image replaced: galleryId={}, hospitalId={}",
                galleryId,
                hospitalId
        );

        return ApiResponse
                .<GalleryImageResponse>builder()
                .success(true)
                .message("Gallery image replaced successfully")
                .data(galleryMapper.toResponse(updatedGallery))
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<Void> delete(
            Long galleryId
    ) {

        Long hospitalId =
                tenantContextService.getCurrentHospitalId();

        HospitalGallery gallery =
                getGallery(galleryId, hospitalId);

        gallery.setDeletedAt(
                java.time.LocalDateTime.now()
        );

        galleryRepository.save(gallery);

        log.info(
                "Hospital gallery image deleted: galleryId={}, hospitalId={}",
                galleryId,
                hospitalId
        );

        return ApiResponse
                .<Void>builder()
                .success(true)
                .message("Gallery image deleted successfully")
                .build();
    }

    private HospitalGallery getGallery(
            Long galleryId,
            Long hospitalId
    ) {

        return galleryRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(
                        galleryId,
                        hospitalId
                )
                .orElseThrow(
                        () -> new BusinessException(
                                "Gallery image not found"
                        )
                );
    }
}