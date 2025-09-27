export const API_BASE = import.meta.env.VITE_API_BASE_URL

console.log("[v0] API_BASE configured as:", API_BASE)

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

  // Update incident
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

  // Update incident status (admin only)
  updateStatus: (id, status) =>
    apiRequest(`/incidents/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  // Award points for approved incident
  awardPoints: (id) =>
    apiRequest(`/incidents/${id}/award-points`, {
      method: "PATCH",
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

  // Update user profile
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
  // Register new user
  register: (data) =>
    apiRequest("/auth/register", {
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

  // Promote user to admin
  promote: (userId) =>
    apiRequest(`/auth/promote/${userId}`, {
      method: "PATCH",
    }),
}

export const mediaAPI = {
  // Upload media to incident
  upload: (file, incidentId) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("incident_id", incidentId)

    return apiRequest("/media/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    })
  },
}
