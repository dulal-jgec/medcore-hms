import { apiFetch } from "@/lib/api-client";

async function handleResponse(response) {
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Something went wrong");
  }

  return result;
}

export async function getDepartments({
  page = 0,
  size = 50,
  sortBy = "name",
  sortDir = "asc",
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sortBy,
    sortDir,
  });
  const response = await apiFetch(`/departments?${params.toString()}`);
  return handleResponse(response);
}

export async function searchDepartments(keyword, { page = 0, size = 50 } = {}) {
  const params = new URLSearchParams({
    keyword,
    page: String(page),
    size: String(size),
  });
  const response = await apiFetch(`/departments/search?${params.toString()}`);
  return handleResponse(response);
}

export async function createDepartment(data) {
  const response = await apiFetch("/departments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateDepartment(id, data) {
  const response = await apiFetch(`/departments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function uploadDepartmentImage(departmentId, file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiFetch(`/departments/${departmentId}/image`, {
    method: "POST",
    body: formData,
  });
  return handleResponse(response);
}