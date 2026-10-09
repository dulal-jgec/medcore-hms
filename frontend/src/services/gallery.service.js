import { apiFetch } from "@/lib/api-client";

async function handleResponse(response) {
  const text = await response.text();
  const result = text ? JSON.parse(text) : {};

  if (!response.ok || result.success === false) {
    const err = new Error(result.message || `Request failed (${response.status})`);
    err.status = response.status;
    throw err;
  }

  return result;
}

export async function getHospitalGallery(page = 0, size = 20) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  const response = await apiFetch(`/hospital/gallery?${params.toString()}`);
  return handleResponse(response);
}

export async function createGalleryImage(formData) {
  // Do NOT set Content-Type — browser will set multipart boundary
  const response = await apiFetch("/hospital/gallery", {
    method: "POST",
    body: formData,
  });
  return handleResponse(response);
}

export async function deleteGalleryImage(id) {
  const response = await apiFetch(`/hospital/gallery/${id}`, {
    method: "DELETE",
  });
  return handleResponse(response);
}