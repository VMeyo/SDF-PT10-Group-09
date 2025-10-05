export const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1"

console.log("[v0] API_BASE configured as:", API_BASE)
console.log("[v0] Environment mode:", import.meta.env.MODE)
console.log("[v0] Full API URL will be:", window.location.origin + API_BASE)

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
  getAll: () => apiRequest("/incidents/"),

  getById: (id) => apiRequest(`/incidents/${id}`),

  create: (data) =>
    apiRequest("/incidents/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    apiRequest(`/incidents/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    apiRequest(`/incidents/${id}`, {
      method: "DELETE",
    }),

  updateStatus: (id, status) =>
    apiRequest(`/incidents/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  addComment: (id, text) =>
    apiRequest(`/incidents/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  getComments: (id) => apiRequest(`/incidents/${id}/comments`),
}

export const userAPI = {
  getAll: () => apiRequest("/users"),

  getById: (id) => apiRequest(`/users/${id}`),

  edit: (id, data) =>
    apiRequest(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    apiRequest(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    apiRequest(`/users/${id}`, {
      method: "DELETE",
    }),

  updateStatus: (id, status) =>
    apiRequest(`/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  getPoints: () => apiRequest("/users/points"),

  redeemReward: (rewardId, points) =>
    apiRequest("/users/redeem", {
      method: "POST",
      body: JSON.stringify({ reward_id: rewardId, points }),
    }),

  getRedemptions: () => apiRequest("/users/redemptions"),

  getLeaderboard: (top = 10) => apiRequest(`/users/leaderboard?top=${top}`),
}

export const authAPI = {
  register: (data) =>
    apiRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: () => apiRequest("/auth/me"),

  promote: (userId) =>
    apiRequest(`/auth/users/${userId}/promote`, {
      method: "PUT",
    }),

  forgotPassword: (email) =>
    apiRequest("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token, newPassword) =>
    apiRequest(`/auth/reset-password/${token}`, {
      method: "POST",
      body: JSON.stringify({ new_password: newPassword }),
    }),

  changePassword: (currentPassword, newPassword, confirmNewPassword) =>
    apiRequest("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_new_password: confirmNewPassword,
      }),
    }),

}

export const mediaAPI = {
  upload: (file, incidentId) => {
    const formData = new FormData()
    formData.append("file", file)

    return apiRequest(`/media/${incidentId}/upload`, {
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

  getByIncident: (incidentId) => apiRequest(`/media/incident/${incidentId}`),
}

export const adminAPI = {
  getIncidents: (status = null) => {
    const endpoint = status ? `/admin/incidents?status=${status}` : "/admin/incidents"
    return apiRequest(endpoint)
  },

  updateIncidentStatus: (id, status) =>
    apiRequest(`/admin/incidents/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  editIncident: (id, data) =>
    apiRequest(`/admin/incidents/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteIncident: (id) =>
    apiRequest(`/admin/incidents/${id}`, {
      method: "DELETE",
    }),
}
