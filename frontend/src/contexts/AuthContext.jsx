"use client"

import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)

  const API_BASE =
    typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL
      ? import.meta.env.VITE_API_BASE_URL
      : "/api/v1"

  // Initialize token after component mounts to avoid SSR issues
  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    setToken(storedToken)
  }, [])

  useEffect(() => {
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUser = async () => {
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        localStorage.removeItem("token")
        setToken(null)
        setUser(null)
      }
    } catch (error) {
      console.error("Error fetching user:", error)
      localStorage.removeItem("token")
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("token", data.access_token)
        setToken(data.access_token)
        setUser(data.user)
        return { success: true }
      } else {
        return { success: false, error: data.msg || "Login failed" }
      }
    } catch (error) {
      return { success: false, error: "Network error" }
    }
  }

  const signup = async (name, email, phone, password) => {
    try {
      const requestUrl = `${API_BASE}/auth/signup`
      const requestBody = { name, email, phone, password }

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const contentType = response.headers.get("content-type")
      let data = null

      if (contentType && contentType.includes("application/json")) {
        data = await response.json()
      } else {
        const textResponse = await response.text()

        if (response.status === 404) {
          return { success: false, error: "Signup endpoint not found. Please check your backend API configuration." }
        } else if (response.status === 500) {
          return { success: false, error: "Server error. The signup endpoint may not be properly configured." }
        } else {
          return { success: false, error: `Server returned HTML instead of JSON (Status: ${response.status})` }
        }
      }

      if (response.ok && data) {
        return { success: true, message: data.msg || "Account created successfully" }
      } else {
        return { success: false, error: data?.msg || `Signup failed with status ${response.status}` }
      }
    } catch (error) {
      return { success: false, error: "Network error: " + error.message }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
  }

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
