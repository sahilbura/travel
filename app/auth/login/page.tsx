"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, Plane, ArrowLeft, Chrome } from "lucide-react" // Import Chrome icon
import { Button } from "@/app/components/ui/button"
import { Card, CardContent } from "@/app/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { status } = useSession()
  // Ensure default returnUrl points to a protected dashboard route,
  // or a common authenticated landing page.
  const returnUrl = searchParams.get("callbackUrl") || "/dashboard"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false) // For credential login
  const [isGoogleLoading, setIsGoogleLoading] = useState(false) // For Google OAuth login
  const [error, setError] = useState("")

  useEffect(() => {
    document.body.style.setProperty("background-color", "var(--color-bg)")
    return () => {
      document.body.style.removeProperty("background-color")
    }
  }, [])

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(returnUrl)
    }
  }, [status, returnUrl, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Use NextAuth's signIn for credentials
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false, // Prevents NextAuth's default redirect to allow custom handling
      callbackUrl: returnUrl, // Pass the returnUrl for successful redirect
    })

    setLoading(false)

    if (res?.error) {
      setError(res.error)
    } else if (res?.ok && res?.url) {
      // If authentication is successful and a URL is provided by NextAuth (from callbackUrl)
      router.push(res.url)
    }
  }

  // --- New: handleGoogleSignIn function ---
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setError("") // Clear any previous errors

    try {
      await signIn("google", { callbackUrl: returnUrl })
    } catch (err: unknown) {
      console.error("Google sign-in error:", err)
      setError("Failed to sign in with Google. Please try again.")
    } finally {
      setIsGoogleLoading(false)
    }
  }
  // --- End New: handleGoogleSignIn function ---

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
              <h1 className="text-4xl font-light text-[var(--color-primary)] mb-2 tracking-tight">Welcome Back</h1>
              <p className="text-[var(--color-primary)]/80">Sign in to continue your journey</p>
            </div>

            {/* Login Form */}
            <Card className="border border-[var(--color-accent1)]/30 bg-[var(--color-bg)]/50 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg">
              <CardContent className="p-8">
                {/* --- New: Google OAuth Button --- */}
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={loading || isGoogleLoading} // Disable if credential login is ongoing
                  className="w-full bg-[#4285F4] hover:bg-[#357AE8] text-white py-3 rounded-lg font-semibold transition-all duration-300 mb-6 flex items-center justify-center gap-2"
                >
                  {isGoogleLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Chrome className="h-5 w-5" />
                  )}
                  {isGoogleLoading ? "Signing in with Google..." : "Sign in with Google"}
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

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-primary)]/80">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-primary)]/50" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-[var(--color-primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent1)]/50 focus:border-[var(--color-accent1)] transition-colors text-[var(--color-primary)] bg-transparent placeholder:text-[var(--color-primary)]/40"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-primary)]/80">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-primary)]/50" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-12 py-3 border border-[var(--color-primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent1)]/50 focus:border-[var(--color-accent1)] transition-colors text-[var(--color-primary)] bg-transparent placeholder:text-[var(--color-primary)]/40"
                        placeholder="Enter your password"
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

                  <div className="text-right">
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-[var(--color-primary)]/70 hover:text-[var(--color-accent1)] transition-colors"
                    >
                      Forgot your password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || isGoogleLoading} // Disable if Google login is ongoing
                    className="w-full bg-[var(--color-btn)] hover:bg-[var(--color-accent1)] text-white py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Signing In...
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                {/* Sign Up */}
                <div className="text-center mt-8 pt-6 border-t border-[var(--color-primary)]/20">
                  <p className="text-[var(--color-primary)]/80">
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/signup" className="text-[var(--color-accent2)] font-medium hover:underline">
                      Sign up
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