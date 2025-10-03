"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { authAPI, userAPI } from "../../utils/api"
import "../../styles/mobile-fixes.css"

export const ProfilePage = ({ onBack }) => {
  const { user } = useAuth()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [securityData, setSecurityData] = useState({
    question: "",
    answer: "",
  })
  const [showSecuritySetup, setShowSecuritySetup] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const token = localStorage.getItem("token")

  const securityQuestions = [
    "What was the name of your first pet?",
    "What city were you born in?",
    "What is your mother's maiden name?",
    "What was the name of your elementary school?",
    "What is your favorite book?",
    "What was your childhood nickname?",
    "In what city did you meet your spouse/partner?",
    "What is the name of your favorite childhood friend?",
  ]

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await authAPI.me()

      if (response.ok) {
        const profileData = await response.json()

        const incidentsResponse = await fetch(`${API_BASE}/incidents/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (incidentsResponse.ok) {
          const incidents = await incidentsResponse.json()
          const userIncidents = Array.isArray(incidents)
            ? incidents.filter(
                (incident) =>
                  String(incident.created_by) === String(profileData.id) ||
                  String(incident.user_id) === String(profileData.id),
              )
            : []

          profileData.reports_count = userIncidents.length
        }

        setUserData(profileData)
        setEditData({
          name: profileData.name || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
        })
        if (profileData.security_question) {
          setSecurityData({ ...securityData, question: profileData.security_question })
        }
      } else {
        console.error("Failed to fetch profile")
        setUserData(user)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      setUserData(user)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setUpdating(true)

    try {
      const response = await userAPI.update(userData.id, editData)

      if (response.ok) {
        setMessage("Profile updated successfully")
        setEditMode(false)
        await fetchUserProfile()
      } else {
        const errorData = await response.json()
        setError(errorData.msg || errorData.message || "Failed to update profile")
      }
    } catch (error) {
      setError("Error updating profile")
    } finally {
      setUpdating(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match")
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setUpdating(true)

    try {
      const response = await authAPI.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.confirmPassword,
      )

      if (response.ok) {
        setMessage("Password updated successfully")
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        const errorData = await response.json()
        setError(errorData.msg || errorData.message || "Failed to update password")
      }
    } catch (error) {
      setError("Error updating password")
    } finally {
      setUpdating(false)
    }
  }

  const handleSecurityQuestionSetup = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")

    if (!securityData.question || !securityData.answer) {
      setError("Please select a question and provide an answer")
      return
    }

    if (securityData.answer.length < 3) {
      setError("Answer must be at least 3 characters long")
      return
    }

    setUpdating(true)

    try {
      const endpoint = userData?.security_question ? "/auth/security-question" : "/auth/setup-security-question"
      const method = userData?.security_question ? "PUT" : "POST"

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          security_question: securityData.question,
          security_answer: securityData.answer,
        }),
      })

      if (response.ok) {
        setMessage(
          userData?.security_question
            ? "Security question updated successfully"
            : "Security question set up successfully",
        )
        setShowSecuritySetup(false)
        setSecurityData({ ...securityData, answer: "" })
        fetchUserProfile()
      } else {
        const errorData = await response.json()
        setError(errorData.msg || errorData.message || "Failed to set up security question")
      }
    } catch (error) {
      setError("Error setting up security question")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Profile</h3>
          <p className="text-gray-600">Fetching your profile information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="back-to-dashboard-mobile md:flex md:items-center md:text-gray-600 md:hover:text-gray-800 md:mb-4 md:transition-colors md:bg-transparent md:border-none md:p-0 md:min-h-auto md:font-normal"
          >
            <span className="mr-2">←</span>
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and security settings</p>
        </div>

        {message && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{message}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information Card */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditMode(false)
                      setEditData({
                        name: userData.name || "",
                        email: userData.email || "",
                        phone: userData.phone || "",
                      })
                    }}
                    className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, var(--ajali-gradient-start), var(--ajali-gradient-end))",
                  }}
                >
                  <span className="text-white text-2xl font-bold">
                    {userData?.name
                      ? userData.name.charAt(0).toUpperCase()
                      : userData?.username
                        ? userData.username.charAt(0).toUpperCase()
                        : user?.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {userData?.name || userData?.username || user?.name || "User"}
                  </h3>
                  <p className="text-gray-600">
                    {userData?.role === "admin" || user?.role === "admin" ? "Emergency Admin" : "Citizen Reporter"}
                  </p>
                </div>
              </div>

              {editMode ? (
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full sm:w-auto px-6 py-3 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: "linear-gradient(135deg, var(--ajali-gradient-start), var(--ajali-gradient-end))",
                    }}
                  >
                    {updating ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900">{userData?.email || user?.email || "Not available"}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900">{userData?.username || user?.username || "Not available"}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900">{userData?.phone || "Not provided"}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            userData?.role === "admin" || user?.role === "admin"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {userData?.role === "admin" || user?.role === "admin" ? "Administrator" : "Standard User"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {userData?.created_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-900">{new Date(userData.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Account Stats Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Stats</h2>

              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">Reports Submitted</p>
                      <p className="text-2xl font-bold text-red-700">{userData?.reports_count || 0}</p>
                    </div>
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">📋</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Community Points</p>
                      <p className="text-2xl font-bold text-green-700">{userData?.points || 0}</p>
                    </div>
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">🏆</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Account Status</p>
                      <p className="text-sm font-bold text-blue-700">Active</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">✓</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Question Section */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Security Question</h2>
              {securityData.question && !showSecuritySetup && (
                <button
                  onClick={() => setShowSecuritySetup(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Update Question
                </button>
              )}
            </div>

            {securityData.question && !showSecuritySetup ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-green-600 text-lg">✓</span>
                  <p className="text-sm font-medium text-green-800">Security question is set up</p>
                </div>
                <p className="text-sm text-green-700">
                  You can use your security question to reset your password if you forget it.
                </p>
              </div>
            ) : (
              <>
                {!securityData.question && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-yellow-600 text-lg">⚠</span>
                      <p className="text-sm font-medium text-yellow-800">Security question not set</p>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Set up a security question to help recover your account if you forget your password.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSecurityQuestionSetup} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Security Question</label>
                    <select
                      value={securityData.question}
                      onChange={(e) => setSecurityData({ ...securityData, question: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      required
                    >
                      <option value="">Choose a question...</option>
                      {securityQuestions.map((q, index) => (
                        <option key={index} value={q}>
                          {q}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Answer</label>
                    <input
                      type="text"
                      value={securityData.answer}
                      onChange={(e) => setSecurityData({ ...securityData, answer: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      placeholder="Enter your answer"
                      required
                      minLength={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Remember this answer - you'll need it to reset your password
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={updating}
                      className="px-6 py-3 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: "linear-gradient(135deg, var(--ajali-gradient-start), var(--ajali-gradient-end))",
                      }}
                    >
                      {updating ? "Saving..." : "Save Security Question"}
                    </button>
                    {showSecuritySetup && securityData.question && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowSecuritySetup(false)
                          setSecurityData({ ...securityData, answer: "" })
                        }}
                        className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Password Update Section */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>

            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full sm:w-auto px-6 py-3 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, var(--ajali-gradient-start), var(--ajali-gradient-end))",
                }}
              >
                {updating ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
