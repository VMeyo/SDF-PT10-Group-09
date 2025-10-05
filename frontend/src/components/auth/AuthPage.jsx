"use client"

import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { API_BASE } from "../../utils/api"

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetStep, setResetStep] = useState(1) // 1: enter email, 2: check email message, 3: enter new password with token
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    resetEmail: "",
    resetToken: "",
    newPassword: "",
    confirmNewPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const { login, signup } = useAuth()

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
      if (!formData.name.trim()) {
        setError("Name is required")
        setLoading(false)
        return
      }

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
        result = await signup(formData.name, formData.email, formData.phone, formData.password)
      }

      if (result.success) {
        if (!isLogin) {
          setSuccess("Account created successfully! You can now sign in.")
          setFormData({
            name: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
            resetEmail: "",
            resetToken: "",
            newPassword: "",
            confirmNewPassword: "",
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

    if (resetStep === 1) {
      if (!formData.resetEmail) {
        setError("Please enter your email address")
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.resetEmail)) {
        setError("Please enter a valid email address")
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
          body: JSON.stringify({ email: formData.resetEmail }),
        })

        const data = await response.json()

        if (response.ok) {
          setSuccess("Password reset email sent! Please check your inbox and follow the instructions.")
          setResetStep(2)
        } else {
          setError(data.message || data.msg || "Failed to send reset email")
        }
      } catch (err) {
        setError("Network error. Please try again.")
      }

      setLoading(false)
    } else if (resetStep === 3) {
      if (!formData.resetToken) {
        setError("Please enter the reset token from your email")
        return
      }

      if (!formData.newPassword || !formData.confirmNewPassword) {
        setError("Please enter and confirm your new password")
        return
      }

      if (formData.newPassword.length < 6) {
        setError("Password must be at least 6 characters long")
        return
      }

      if (formData.newPassword !== formData.confirmNewPassword) {
        setError("Passwords do not match")
        return
      }

      setLoading(true)
      setError("")

      try {
        const response = await fetch(`${API_BASE}/auth/reset-password/${formData.resetToken}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            new_password: formData.newPassword,
          }),
        })

        const data = await response.json()

        if (response.ok) {
          setSuccess("Password reset successfully! Redirecting to sign in...")
          setTimeout(() => {
            setShowForgotPassword(false)
            setResetStep(1)
            setSuccess("")
            setFormData({
              name: "",
              email: "",
              phone: "",
              password: "",
              confirmPassword: "",
              resetEmail: "",
              resetToken: "",
              newPassword: "",
              confirmNewPassword: "",
            })
          }, 2000)
        } else {
          setError(data.message || data.msg || "Failed to reset password. Token may be invalid or expired.")
        }
      } catch (err) {
        setError("Network error. Please try again.")
      }

      setLoading(false)
    }
  }

  if (showForgotPassword) {
    return (
      <div className="ajali-container">
        <div className="ajali-main">
          {/* Left side - Main content */}
          <div>
            <div className="ajali-logo">
              <div className="ajali-logo-icon">⚠️</div>
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
              <p>
                {resetStep === 1 && "Enter your email address to receive a password reset link."}
                {resetStep === 2 && "Check your email for the reset link and token."}
                {resetStep === 3 && "Enter the token from your email and create a new password."}
              </p>
            </div>
          </div>

          {/* Right side - Access Portal */}
          <div className="access-portal">
            <h3>Reset Password</h3>
            <p className="subtitle">
              {resetStep === 1 && "Enter your email address to get started"}
              {resetStep === 2 && "Check your email inbox"}
              {resetStep === 3 && "Enter your reset token and new password"}
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

            <form onSubmit={handleForgotPassword}>
              {resetStep === 1 && (
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="resetEmail"
                    className="form-input"
                    placeholder="Enter your email address"
                    value={formData.resetEmail}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}

              {resetStep === 2 && (
                <div className="form-group">
                  <div
                    style={{
                      padding: "16px",
                      backgroundColor: "#f0f9ff",
                      borderRadius: "8px",
                      marginBottom: "16px",
                      border: "1px solid #bae6fd",
                    }}
                  >
                    <p style={{ marginBottom: "12px", color: "#0369a1" }}>
                      We've sent a password reset email to <strong>{formData.resetEmail}</strong>
                    </p>
                    <p style={{ fontSize: "14px", color: "#0c4a6e" }}>
                      Click the link in the email or enter the token below to continue.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="gradient-button"
                    onClick={() => setResetStep(3)}
                    style={{ marginTop: "8px" }}
                  >
                    I have my reset token
                  </button>
                </div>
              )}

              {resetStep === 3 && (
                <>
                  <div className="form-group">
                    <label className="form-label">Reset Token</label>
                    <input
                      type="text"
                      name="resetToken"
                      className="form-input"
                      placeholder="Enter the token from your email"
                      value={formData.resetToken}
                      onChange={handleInputChange}
                      required
                    />
                    <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                      Check your email for the reset token
                    </p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      className="form-input"
                      placeholder="Enter new password"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmNewPassword"
                      className="form-input"
                      placeholder="Confirm new password"
                      value={formData.confirmNewPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </>
              )}

              {resetStep !== 2 && (
                <button type="submit" className="gradient-button" disabled={loading}>
                  {loading
                    ? resetStep === 1
                      ? "Sending..."
                      : "Resetting..."
                    : resetStep === 1
                      ? "Send Reset Email"
                      : "Reset Password"}
                </button>
              )}
            </form>

            <div className="auth-link">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setShowForgotPassword(false)
                  setResetStep(1)
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
            <div className="ajali-logo-icon">
              <img src="./ajali.svg" alt="ajali logo" />
            </div>
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
              <div className="feature-icon red">⚠️</div>
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
            <div className="emergency-notice-icon">⚠️</div>
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
            {!isLogin && (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </>
            )}

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
                  name: "",
                  email: "",
                  phone: "",
                  password: "",
                  confirmPassword: "",
                  resetEmail: "",
                  resetToken: "",
                  newPassword: "",
                  confirmNewPassword: "",
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
