import { apiFetch } from "@/lib/api-client";

async function handleResponse(response) {
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Something went wrong");
  }

  return result;
}

 

export async function createAppointment(data) {
  const response = await apiFetch("/appointments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

 
export async function getMyAppointments({
  page = 0,
  size = 20,
  sortBy = "appointmentDate",
  sortDir = "desc",
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sortBy,
    sortDir,
  });

  const response = await apiFetch(`/appointments/me?${params.toString()}`);
  return handleResponse(response);
}


export async function getAppointments({
  page = 0,
  size = 10,
  sortBy = "appointmentDate",
  sortDir = "asc",
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sortBy,
    sortDir,
  });

  const response = await apiFetch(
    `/appointments?${params.toString()}`
  );

  return handleResponse(response);
}

 

export async function getTodayAppointments({
  page = 0,
  size = 10,
  sortBy = "startTime",
  sortDir = "asc",
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sortBy,
    sortDir,
  });

  const response = await apiFetch(
    `/appointments/today?${params.toString()}`
  );

  return handleResponse(response);
}

 

export async function getDoctorAppointments(
  doctorId,
  {
    page = 0,
    size = 10,
  } = {}
) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  const response = await apiFetch(
    `/appointments/doctor/${doctorId}?${params.toString()}`
  );

  return handleResponse(response);
}

 

export async function getPatientAppointments(
  patientId,
  {
    page = 0,
    size = 10,
  } = {}
) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  const response = await apiFetch(
    `/appointments/patient/${patientId}?${params.toString()}`
  );

  return handleResponse(response);
}

 

export async function getAppointmentById(appointmentId) {
  const response = await apiFetch(
    `/appointments/${appointmentId}`
  );

  return handleResponse(response);
}

 

export async function updateAppointmentStatus(
  appointmentId,
  status
) {
  const response = await apiFetch(
    `/appointments/${appointmentId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
      }),
    }
  );

  return handleResponse(response);
}
 

export async function checkInAppointment(appointmentId) {
  const response = await apiFetch(
    `/appointments/${appointmentId}/check-in`,
    {
      method: "PATCH",
    }
  );

  return handleResponse(response);
}



export async function cancelAppointment(appointmentId) {
  const response = await apiFetch(
    `/appointments/${appointmentId}/cancel`,
    {
      method: "PATCH",
    }
  );

  return handleResponse(response);
}

 

export async function deleteAppointment(appointmentId) {
  const response = await apiFetch(
    `/appointments/${appointmentId}`,
    {
      method: "DELETE",
    }
  );

  return handleResponse(response);
}

 

export async function restoreAppointment(appointmentId) {
  const response = await apiFetch(
    `/appointments/${appointmentId}/restore`,
    {
      method: "PATCH",
    }
  );

  return handleResponse(response);
}

 

export async function getAvailableSlots(
  doctorId,
  appointmentDate
) {
  const params = new URLSearchParams({
    doctorId: String(doctorId),
    appointmentDate,
  });

  const response = await apiFetch(
    `/appointments/available-slots?${params.toString()}`
  );

  return handleResponse(response);
}