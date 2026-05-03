"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, User, Plane, ArrowLeft, Chrome } from "lucide-react" // Import Chrome icon for Google
import { Button } from "@/app/components/ui/button"
import { Card, CardContent } from "@/app/components/ui/card"
import { signIn } from "next-auth/react" // Import signIn function

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isGoogleLoading, setIsGoogleLoading] = useState(false) // New state for Google button loading

  useEffect(() => {
    document.body.style.setProperty("background-color", "var(--color-bg)")
    return () => {
      document.body.style.removeProperty("background-color")
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", { // Assuming you have a custom registration API route
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      if (response.ok) {
        // After successful registration, you might want to automatically sign them in
        // using credentials provider or redirect to login.
        router.push("/auth/login?callbackUrl=/dashboard")
      } else {
        const data = await response.json()
        setError(data.message || "Registration failed. Please try again.")
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "An unexpected error occurred during registration. Please try again.")
      } else {
        setError("An unexpected error occurred during registration. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  // --- New: handleGoogleSignIn function ---
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true) // Set loading state for Google button
    setError("") // Clear previous errors
    try {
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch (err: unknown) {
      console.error("Google sign-in error:", err)
      setError("Failed to sign in with Google. Please try again.")
    } finally {
      setIsGoogleLoading(false) // Reset loading state
    }
  }

  return (
    <div className="geist-sans min-h-screen bg-[var(--color-bg)] text-[var(--color-primary)]">
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

              <h1 className="text-4xl font-light text-[var(--color-primary)] mb-2 tracking-tight">Create Account</h1>
              <p className="text-[var(--color-primary)]/80">Start your journey with us today</p>
            </div>

            {/* Signup Form */}
            <Card className="border border-[var(--color-accent1)]/30 bg-[var(--color-bg)]/50 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg">
              <CardContent className="p-8">
                {/* --- New: Google OAuth Button --- */}
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading || loading} // Disable if custom form is submitting too
                  className="w-full bg-[#4285F4] hover:bg-[#357AE8] text-white py-3 rounded-lg font-semibold transition-all duration-300 mb-6 flex items-center justify-center gap-2"
                >
                  {isGoogleLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Chrome className="h-5 w-5" />
                  )}
                  {isGoogleLoading ? "Signing in with Google..." : "Sign up with Google"}
                </Button>

                <div className="relative flex items-center justify-center mb-6">
                  <span className="absolute left-0 w-full border-t border-[var(--color-primary)]/20"></span>
                  <span className="relative z-10 bg-[var(--color-bg)] px-3 text-sm text-[var(--color-primary)]/70">
                    OR
                  </span>
                </div>
                {/* --- End New: Google OAuth Button --- */}


                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-sm font-medium"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Name Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-primary)]/80">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-primary)]/50" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-[var(--color-primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent1)]/50 focus:border-[var(--color-accent1)] transition-colors text-[var(--color-primary)] bg-transparent placeholder:text-[var(--color-primary)]/40"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-primary)]/80">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-primary)]/50" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-[var(--color-primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent1)]/50 focus:border-[var(--color-accent1)] transition-colors text-[var(--color-primary)] bg-transparent placeholder:text-[var(--color-primary)]/40"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-primary)]/80">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-primary)]/50" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-12 py-3 border border-[var(--color-primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent1)]/50 focus:border-[var(--color-accent1)] transition-colors text-[var(--color-primary)] bg-transparent placeholder:text-[var(--color-primary)]/40"
                        placeholder="Create a password"
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

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-primary)]/80">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-primary)]/50" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-12 py-3 border border-[var(--color-primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent1)]/50 focus:border-[var(--color-accent1)] transition-colors text-[var(--color-primary)] bg-transparent placeholder:text-[var(--color-primary)]/40"
                        placeholder="Confirm your password"
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

                  {/* Terms and Conditions */}
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="terms"
                      required
                      className="mt-1 h-4 w-4 text-[var(--color-accent1)] bg-transparent border-[var(--color-primary)]/30 rounded focus:ring-[var(--color-accent1)]"
                    />
                    <label htmlFor="terms" className="text-sm text-[var(--color-primary)]/80">
                      I agree to the{" "}
                      <Link href="/terms" className="text-[var(--color-accent2)] hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-[var(--color-accent2)] hover:underline">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading || isGoogleLoading} // Disable if Google is loading too
                    className="w-full bg-[var(--color-btn)] hover:bg-[var(--color-accent1)] text-white py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating Account...
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>

                {/* Login Link */}
                <div className="text-center mt-8 pt-6 border-t border-[var(--color-primary)]/20">
                  <p className="text-[var(--color-primary)]/80">
                    Already have an account?{" "}
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