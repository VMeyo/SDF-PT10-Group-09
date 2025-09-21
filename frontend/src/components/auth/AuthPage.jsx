"use client"

import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const { login, signup } = useAuth()
  const API_BASE = import.meta.env.VITE_API_BASE_URL

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    if (!isLogin) {
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long")
        setLoading(false)
        return
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match")
        setLoading(false)
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address")
        setLoading(false)
        return
      }
    }

    try {
      let result
      if (isLogin) {
        result = await login(formData.email, formData.password)
      } else {
        result = await signup(null, formData.email, null, formData.password)
      }

      if (result.success) {
        if (!isLogin) {
          setSuccess("Account created successfully! You can now sign in.")
          setFormData({
            email: "",
            password: "",
            confirmPassword: "",
          })
          setTimeout(() => {
            setIsLogin(true)
            setSuccess("")
          }, 2000)
        }
      } else {
        setError(result.error || "An error occurred")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    }

    setLoading(false)
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!formData.email) {
      setError("Please enter your email address")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Password reset instructions sent to your email")
        setTimeout(() => {
          setShowForgotPassword(false)
          setSuccess("")
        }, 3000)
      } else {
        setError(data.message || "Failed to send reset email")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    }

    setLoading(false)
  }

  if (showForgotPassword) {
    return (
      <div className="ajali-container">
        <div className="ajali-main">
          {/* Left side - Main content */}
          <div>
            <div className="ajali-logo">
              <div className="ajali-logo-icon">⚠</div>
              <div className="ajali-logo-text">
                <h1>Ajali</h1>
                <p>Emergency Response System</p>
              </div>
            </div>

            <div className="ajali-hero">
              <h2>
                Reset Password
                <br />
                <span className="hero-accent">Secure Access</span>
              </h2>
              <p>Enter your email address and we'll send you instructions to reset your password.</p>
            </div>
          </div>

          {/* Right side - Access Portal */}
          <div className="access-portal">
            <h3>Reset Password</h3>
            <p className="subtitle">Enter your email to receive reset instructions</p>

            {error && (
              <div
                className="error-message"
                style={{
                  color: "#dc2626",
                  backgroundColor: "#fef2f2",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  border: "1px solid #fecaca",
                }}
              >
                {error}
              </div>
            )}

            {success && (
              <div
                className="success-message"
                style={{
                  color: "#059669",
                  backgroundColor: "#f0fdf4",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  border: "1px solid #bbf7d0",
                }}
              >
                {success}
              </div>
            )}

            <form onSubmit={handleForgotPassword}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <button type="submit" className="gradient-button" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Instructions"}
              </button>
            </form>

            <div className="auth-link">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setShowForgotPassword(false)
                  setError("")
                  setSuccess("")
                }}
              >
                Back to Sign In
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ajali-container">
      <div className="ajali-main">
        {/* Left side - Main content */}
        <div>
          <div className="ajali-logo">
            <div className="ajali-logo-icon">⚠</div>
            <div className="ajali-logo-text">
              <h1>Ajali</h1>
              <p>Emergency Response System</p>
            </div>
          </div>

          <div className="ajali-hero">
            <h2>
              Report Accidents
              <br />
              <span className="hero-accent">Save Lives</span>
            </h2>
            <p>
              Quick accident reporting and emergency response coordination. Every second counts in emergency situations.
            </p>
          </div>

          <div className="ajali-features">
            <div className="feature-card">
              <div className="feature-icon red">⚠</div>
              <div className="feature-content">
                <h3>Instant Reporting</h3>
                <p>Report accidents quickly</p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon blue">🛡</div>
              <div className="feature-content">
                <h3>Verified Response</h3>
                <p>Trusted emergency data</p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon orange">📞</div>
              <div className="feature-content">
                <h3>Emergency Contacts</h3>
                <p>Direct emergency services</p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon green">👥</div>
              <div className="feature-content">
                <h3>Community Support</h3>
                <p>Help your community</p>
              </div>
            </div>
          </div>

          <div className="emergency-notice">
            <div className="emergency-notice-icon">⚠</div>
            <div className="emergency-notice-content">
              <h4>Emergency Notice</h4>
              <p>
                For immediate life-threatening emergencies, call your local emergency services directly. This platform
                complements but does not replace emergency services.
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Access Portal */}
        <div className="access-portal">
          <h3>{isLogin ? "Access Portal" : "Join Response Network"}</h3>
          <p className="subtitle">
            {isLogin ? "Sign in to report and track accidents" : "Create account to help save lives"}
          </p>

          {error && (
            <div
              className="error-message"
              style={{
                color: "#dc2626",
                backgroundColor: "#fef2f2",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "16px",
                border: "1px solid #fecaca",
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="success-message"
              style={{
                color: "#059669",
                backgroundColor: "#f0fdf4",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "16px",
                border: "1px solid #bbf7d0",
              }}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder={isLogin ? "Enter your password" : "Create a password"}
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-input"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}

            <button type="submit" className="gradient-button" disabled={loading}>
              {loading ? (isLogin ? "Signing In..." : "Creating Account...") : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          {isLogin && (
            <div className="auth-link" style={{ marginTop: "12px" }}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setShowForgotPassword(true)
                  setError("")
                }}
                style={{ fontSize: "14px", color: "#6366f1" }}
              >
                Forgot your password?
              </a>
            </div>
          )}

          <div className="auth-link">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                setIsLogin(!isLogin)
                setError("")
                setSuccess("")
                setFormData({
                  email: "",
                  password: "",
                  confirmPassword: "",
                })
              }}
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </a>
          </div>

          <p className="agreement-text">
            By using Ajali, you agree to help create a safer community through accurate accident reporting.
          </p>
        </div>
      </div>
    </div>
  )
}
