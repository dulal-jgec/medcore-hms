package com.medcore.features.hospital.gallery.service;

import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.RestPage;
import com.medcore.features.hospital.gallery.dto.CreateGalleryImageRequest;
import com.medcore.features.hospital.gallery.dto.GalleryImageResponse;
import com.medcore.features.hospital.gallery.dto.UpdateGalleryImageRequest;
import org.springframework.web.multipart.MultipartFile;

public interface HospitalGalleryService {

    ApiResponse<GalleryImageResponse> create(
            CreateGalleryImageRequest request, MultipartFile file);

    ApiResponse<RestPage<GalleryImageResponse>> getAll(int page, int size);

    ApiResponse<GalleryImageResponse> getById(Long galleryId);

    ApiResponse<GalleryImageResponse> update(
            Long galleryId, UpdateGalleryImageRequest request);

    ApiResponse<GalleryImageResponse> replaceImage(
            Long galleryId, MultipartFile file);

    ApiResponse<Void> delete(Long galleryId);
}