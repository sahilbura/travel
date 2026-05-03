"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, ArrowLeft, Plane, Eye, EyeOff, Lock } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent } from "@/app/components/ui/card"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<"email" | "otp" | "reset">("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    document.body.style.setProperty("background-color", "var(--color-bg)")
    return () => {
      document.body.style.removeProperty("background-color")
    }
  }, [])

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message)
        setStep("otp")
      } else {
        setError(data.message || "Failed to send reset code")
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An error occurred. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit code")
      return
    }
    setStep("reset")
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp, newPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Password reset successfully! Redirecting to login...")
        setTimeout(() => {
          router.push("/auth/login")
        }, 2000)
      } else {
        setError(data.message || "Failed to reset password")
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An error occurred. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const renderEmailStep = () => (
    <form onSubmit={handleSendOTP} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--color-primary)]/80">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-primary)]/50" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-3 border border-[var(--color-primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent1)]/50 focus:border-[var(--color-accent1)] transition-colors text-[var(--color-primary)] bg-transparent placeholder:text-[var(--color-primary)]/40"
            placeholder="Enter your email address"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-[var(--color-btn)] hover:bg-[var(--color-accent1)] text-white py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Sending Code...
          </div>
        ) : (
          "Send Reset Code"
        )}
      </Button>
    </form>
  )

  const renderOTPStep = () => (
    <form onSubmit={handleVerifyOTP} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--color-primary)]/80">Verification Code</label>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          required
          maxLength={6}
          className="w-full px-4 py-3 border border-[var(--color-primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent1)]/50 focus:border-[var(--color-accent1)] transition-colors text-[var(--color-primary)] bg-transparent text-center text-2xl font-mono tracking-widest placeholder:text-[var(--color-primary)]/40"
          placeholder="000000"
        />
        <p className="text-sm text-[var(--color-primary)]/70">Enter the 6-digit code sent to {email}</p>
      </div>

      <Button
        type="submit"
        disabled={otp.length !== 6}
        className="w-full bg-[var(--color-btn)] hover:bg-[var(--color-accent1)] text-white py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
      >
        Verify Code
      </Button>

      <Button
        type="button"
        variant="ghost"
        onClick={() => setStep("email")}
        className="w-full text-[var(--color-primary)]/70 hover:text-white hover:bg-white/10"
      >
        Back to Email
      </Button>
    </form>
  )

  const renderResetStep = () => (
    <form onSubmit={handleResetPassword} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--color-primary)]/80">New Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-primary)]/50" />
          <input
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full pl-10 pr-12 py-3 border border-[var(--color-primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent1)]/50 focus:border-[var(--color-accent1)] transition-colors text-[var(--color-primary)] bg-transparent placeholder:text-[var(--color-primary)]/40"
            placeholder="Enter new password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-primary)]/50 hover:text-[var(--color-primary)] transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--color-primary)]/80">Confirm New Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-primary)]/50" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full pl-10 pr-12 py-3 border border-[var(--color-primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent1)]/50 focus:border-[var(--color-accent1)] transition-colors text-[var(--color-primary)] bg-transparent placeholder:text-[var(--color-primary)]/40"
            placeholder="Confirm new password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-primary)]/50 hover:text-[var(--color-primary)] transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-[var(--color-btn)] hover:bg-[var(--color-accent1)] text-white py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Resetting Password...
          </div>
        ) : (
          "Reset Password"
        )}
      </Button>
    </form>
  )

  const getStepTitle = () => {
    switch (step) {
      case "email":
        return "Forgot Password"
      case "otp":
        return "Enter Verification Code"
      case "reset":
        return "Set New Password"
      default:
        return "Forgot Password"
    }
  }

  const getStepDescription = () => {
    switch (step) {
      case "email":
        return "Enter your email address and we'll send you a code to reset your password"
      case "otp":
        return "We've sent a 6-digit code to your email address"
      case "reset":
        return "Choose a new password for your account"
      default:
        return ""
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-primary)]">
      <div className="relative">
        {/* Navigation */}
        <div className="border-b border-[var(--color-primary)]/10 bg-[var(--color-bg)]/50 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-[var(--color-primary)]/80 hover:text-white hover:bg-white/10 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[var(--color-accent1)] to-[var(--color-accent2)] rounded-2xl mb-6">
                <Plane className="h-8 w-8 text-white" />
              </div>

              <h1 className="text-4xl font-light text-[var(--color-primary)] mb-2 tracking-tight">{getStepTitle()}</h1>
              <p className="text-[var(--color-primary)]/80">{getStepDescription()}</p>
            </div>

            {/* Form */}
            <Card className="border border-[var(--color-accent1)]/30 bg-[var(--color-bg)]/50 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg">
              <CardContent className="p-8">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-sm font-medium mb-6"
                  >
                    {error}
                  </motion.div>
                )}

                {message && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg text-green-300 text-sm font-medium mb-6"
                  >
                    {message}
                  </motion.div>
                )}

                {step === "email" && renderEmailStep()}
                {step === "otp" && renderOTPStep()}
                {step === "reset" && renderResetStep()}

                {/* Back to Login */}
                <div className="text-center mt-8 pt-6 border-t border-[var(--color-primary)]/20">
                  <p className="text-[var(--color-primary)]/80">
                    Remember your password?{" "}
                    <Link href="/auth/login" className="text-[var(--color-accent2)] font-medium hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
