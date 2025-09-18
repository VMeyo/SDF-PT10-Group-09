"use client"

import { useState } from "react"

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", { email, password, isLogin })
  }

  return (
    <div className="ajali-container">
      <div className="ajali-main">
        {/* Left side - Main content */}
        <div>
          {/* Logo */}
          <div className="ajali-logo">
            <div className="ajali-logo-icon">⚠</div>
            <div className="ajali-logo-text">
              <h1>Ajali</h1>
              <p>Emergency Response System</p>
            </div>
          </div>

          {/* Hero section */}
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

          {/* Features grid */}
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

          {/* Emergency notice */}
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
          <h3>Access Portal</h3>
          <p className="subtitle">Sign in to report and track accidents</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="gradient-button">
              {isLogin ? "Sign In" : "Sign Up"}
            </button>
          </form>

          <div className="auth-link">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                setIsLogin(!isLogin)
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
