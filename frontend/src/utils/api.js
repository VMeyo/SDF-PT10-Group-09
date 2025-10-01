export const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1"

console.log("[v0] API_BASE configured as:", API_BASE)
console.log("[v0] Environment mode:", import.meta.env.MODE)

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`
  console.log("[v0] Making API request to:", url)

  const config = {
    headers: getAuthHeaders(),
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)
    console.log("[v0] API response status:", response.status)
    return response
  } catch (error) {
    console.error("[v0] API request failed:", error)
    throw error
  }
}

export const incidentAPI = {
  // Get all incidents
  getAll: () => apiRequest("/incidents"),

  // Get single incident
  getById: (id) => apiRequest(`/incidents/${id}`),

  // Create new incident
  create: (data) =>
    apiRequest("/incidents", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    apiRequest(`/incidents/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Delete incident
  delete: (id) =>
    apiRequest(`/incidents/${id}`, {
      method: "DELETE",
    }),

  updateStatus: (id, status) =>
    apiRequest(`/incidents/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  // Add comment to incident
  addComment: (id, text) =>
    apiRequest(`/incidents/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  // Get comments for incident
  getComments: (id) => apiRequest(`/incidents/${id}/comments`),
}

export const userAPI = {
  // Get all users (admin only)
  getAll: () => apiRequest("/users"),

  // Get single user
  getById: (id) => apiRequest(`/users/${id}`),

  update: (id, data) =>
    apiRequest(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Delete user (admin only)
  delete: (id) =>
    apiRequest(`/users/${id}`, {
      method: "DELETE",
    }),
}

export const authAPI = {
  register: (data) =>
    apiRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Login user
  login: (data) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Get current user
  me: () => apiRequest("/auth/me"),

  promote: (userId) =>
    apiRequest(`/auth/promote/${userId}`, {
      method: "PATCH",
    }),
}

export const mediaAPI = {
  upload: (file, incidentId) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("incident_id", incidentId)

    return apiRequest(`/media/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    })
  },

  delete: (mediaId) =>
    apiRequest(`/media/${mediaId}`, {
      method: "DELETE",
    }),
}

export const adminAPI = {
  getIncidents: (status = null) => {
    const endpoint = status ? `/incidents?status=${status}` : "/incidents"
    return apiRequest(endpoint)
  },

  updateIncidentStatus: (id, status) =>
    apiRequest(`/incidents/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
}
