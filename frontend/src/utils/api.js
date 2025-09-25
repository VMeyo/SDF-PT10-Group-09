export const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1"

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
