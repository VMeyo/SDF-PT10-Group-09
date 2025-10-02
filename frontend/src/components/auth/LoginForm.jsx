"use client"

import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card"

export const LoginForm = ({ onToggleForm }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetStep, setResetStep] = useState(1) // 1: email, 2: security question, 3: new password
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("")
  const [securityQuestion, setSecurityQuestion] = useState("")
  const [securityAnswer, setSecurityAnswer] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [resetToken, setResetToken] = useState("")
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("")
  const { login } = useAuth()

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await login(email, password)

    if (!result.success) {
      setError(result.error)
    }

    setLoading(false)
  }

  const handleForgotPasswordStep1 = async (e) => {
    e.preventDefault()
    setForgotPasswordLoading(true)
    setError("")
    setForgotPasswordMessage("")

    try {
      const response = await fetch(`${API_BASE_URL}/auth/get-security-question`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      })

      const data = await response.json()

      if (response.ok) {
        setSecurityQuestion(data.security_question)
        setResetStep(2)
        setForgotPasswordMessage("Please answer your security question")
      } else {
        setError(data.message || data.msg || "Failed to retrieve security question")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    }

    setForgotPasswordLoading(false)
  }

  const handleForgotPasswordStep2 = async (e) => {
    e.preventDefault()
    setForgotPasswordLoading(true)
    setError("")
    setForgotPasswordMessage("")

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-security-answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: forgotPasswordEmail,
          security_answer: securityAnswer,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResetToken(data.reset_token)
        setResetStep(3)
        setForgotPasswordMessage("Security answer verified. Please enter your new password.")
      } else {
        setError(data.message || data.msg || "Incorrect security answer")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    }

    setForgotPasswordLoading(false)
  }

  const handleForgotPasswordStep3 = async (e) => {
    e.preventDefault()

    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setForgotPasswordLoading(true)
    setError("")
    setForgotPasswordMessage("")

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: forgotPasswordEmail,
          reset_token: resetToken,
          new_password: newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setForgotPasswordMessage("Password reset successfully! You can now sign in with your new password.")
        setTimeout(() => {
          setShowForgotPassword(false)
          setResetStep(1)
          setForgotPasswordEmail("")
          setSecurityAnswer("")
          setNewPassword("")
          setConfirmNewPassword("")
          setResetToken("")
          setForgotPasswordMessage("")
        }, 3000)
      } else {
        setError(data.message || data.msg || "Failed to reset password")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    }

    setForgotPasswordLoading(false)
  }

  if (showForgotPassword) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            {resetStep === 1 && "Enter your email to begin password reset"}
            {resetStep === 2 && "Answer your security question"}
            {resetStep === 3 && "Create your new password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resetStep === 1 && (
            <form onSubmit={handleForgotPasswordStep1} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive-10 border border-destructive-20 rounded-md">
                  {error}
                </div>
              )}

              {forgotPasswordMessage && (
                <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                  {forgotPasswordMessage}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="forgotEmail" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="forgotEmail"
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={forgotPasswordLoading}>
                {forgotPasswordLoading ? "Checking..." : "Continue"}
              </Button>
            </form>
          )}

          {resetStep === 2 && (
            <form onSubmit={handleForgotPasswordStep2} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive-10 border border-destructive-20 rounded-md">
                  {error}
                </div>
              )}

              {forgotPasswordMessage && (
                <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                  {forgotPasswordMessage}
                </div>
              )}

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-1">Security Question:</p>
                <p className="text-blue-800">{securityQuestion}</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="securityAnswer" className="text-sm font-medium">
                  Your Answer
                </label>
                <Input
                  id="securityAnswer"
                  type="text"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  placeholder="Enter your answer"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={forgotPasswordLoading}>
                {forgotPasswordLoading ? "Verifying..." : "Verify Answer"}
              </Button>
            </form>
          )}

          {resetStep === 3 && (
            <form onSubmit={handleForgotPasswordStep3} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive-10 border border-destructive-20 rounded-md">
                  {error}
                </div>
              )}

              {forgotPasswordMessage && (
                <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                  {forgotPasswordMessage}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="newPassword" className="text-sm font-medium">
                  New Password
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmNewPassword" className="text-sm font-medium">
                  Confirm New Password
                </label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full" disabled={forgotPasswordLoading}>
                {forgotPasswordLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setShowForgotPassword(false)
                setResetStep(1)
                setForgotPasswordEmail("")
                setSecurityAnswer("")
                setNewPassword("")
                setConfirmNewPassword("")
                setError("")
                setForgotPasswordMessage("")
              }}
              className="text-primary hover-underline font-medium text-sm"
            >
              Back to Sign In
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">Welcome back</CardTitle>
        <CardDescription>Sign in to your Ajali account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive-10 border border-destructive-20 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-primary hover-underline"
            >
              Forgot password?
            </button>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button onClick={onToggleForm} className="text-primary hover-underline font-medium">
              Sign up
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
