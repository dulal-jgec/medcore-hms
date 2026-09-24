import { apiFetch } from "@/lib/api-client";

async function handleResponse(response) {
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Something went wrong");
  }

  return result;
}

export async function getHospitalProfile() {
  const response = await apiFetch("/hospital/profile");
  return handleResponse(response);
}

export async function updateHospitalProfile(data) {
  const response = await apiFetch("/hospital/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function uploadHospitalLogo(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiFetch("/hospital/profile/logo", {
    method: "POST",
    body: formData,
  });
  return handleResponse(response);
}

export async function uploadHospitalBanner(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiFetch("/hospital/profile/banner", {
    method: "POST",
    body: formData,
  });
  return handleResponse(response);
}