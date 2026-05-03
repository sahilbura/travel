"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence, easeOut, easeIn } from "framer-motion"
import { Globe } from "lucide-react"
import { Button } from "@/app/components/ui/button"
// REMOVED: import { useAuth } from "@/contexts/auth-context"
import { useSession } from "next-auth/react" // NEW: Import useSession from next-auth/react

const interestOptions = [
  { name: "Art & Culture", icon: "🎨" },
  { name: "Nature & Outdoors", icon: "🌲" },
  { name: "Food & Drink", icon: "🍽️" },
  { name: "Adventure Sports", icon: "🏔️" },
  { name: "Relaxation & Spa", icon: "🧘" },
  { name: "Shopping", icon: "🛍️" },
  { name: "History", icon: "🏛️" },
  { name: "Nightlife", icon: "🌙" },
]

// Animation Variants for form elements
const formContainerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.2,
    },
  },
};

const formItemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 12 },
  },
};
const suggestionsListVariants = {
  hidden: { opacity: 0, y: -10, scaleY: 0.95 },
  visible: { opacity: 1, y: 0, scaleY: 1, transition: { duration: 0.2, ease: easeOut } },
  exit: { opacity: 0, y: -10, scaleY: 0.95, transition: { duration: 0.15, ease: easeIn } },
};

export default function CreateTripPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [destination, setDestination] = useState<string>("")
  const [destinationLat, setDestinationLat] = useState<number | null>(null)
  const [destinationLng, setDestinationLng] = useState<number | null>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [budget, setBudget] = useState<number | "">("")
  const [loading, setLoading] = useState(false) // For form submission loading
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)

  // NEW: Use useSession hook from next-auth/react
  const { data: session, status } = useSession()
  const user = session?.user // Get user data from session
  const authLoading = status === "loading" // NextAuth's loading status

  type Suggestion = {
    place_id: number
    display_name: string
    lat: string
    lon: string
    // Add other fields from Nominatim API response if needed
  }
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleInterestChange = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((item) => item !== interest) : [...prev, interest]
    )
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (destination.length > 2 && showSuggestions) {
        fetchNominatimSuggestions(destination)
      } else {
        setSuggestions([])
      }
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [destination, showSuggestions])

  const fetchNominatimSuggestions = async (query: string) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "TripPlannerApp/1.0 (contact@example.com)", // Replace with your app's info
        },
      })
      if (!response.ok) throw new Error("Nominatim API error")
      const data = await response.json()
      setSuggestions(data)
    } catch {
      setSuggestions([]) // Silently fail or set an error state for suggestions
    }
  }

  const handleSuggestionClick = (s: Suggestion) => {
    setDestination(s.display_name)
    setDestinationLat(Number(s.lat))
    setDestinationLng(Number(s.lon))
    setSuggestions([])
    setShowSuggestions(false)
    setErrors((e) => ({ ...e, destination: undefined }))
    setGeneralError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    setGeneralError(null)

    // Ensure user is authenticated before submitting
    if (!user?.id) {
        setGeneralError("Authentication required. Please log in.")
        setLoading(false)
        return
    }

    if (!title.trim()) {
      setErrors((prev) => ({ ...prev, title: "Trip title is required" }))
      setLoading(false)
      return
    }
    if (destinationLat === null || destinationLng === null) {
      setErrors((prev) => ({ ...prev, destination: "Please select a destination from suggestions" }))
      setLoading(false)
      return
    }
    if (!startDate || !endDate) {
      setGeneralError("Please select both start and end dates")
      setLoading(false)
      return
    }
    if (new Date(startDate) >= new Date(endDate)) {
      setGeneralError("End date must be after start date")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/trips/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          destination,
          destinationLat,
          destinationLng,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          interests: selectedInterests,
          budget: budget === "" ? null : Number(budget),
          userId: user.id, // user.id is now directly from useSession
        }),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to create trip" }));
        throw new Error(errorData.message || "Failed to create trip");
      }
      const result = await res.json()
      router.push(`/trips/${result.trip.id}`)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setGeneralError(err.message || "Something went wrong.")
      } else {
        setGeneralError("Something went wrong.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const prefill = urlParams.get("destination")
    if (prefill) {
      setDestination(prefill)
      setShowSuggestions(false) // Don't show suggestions if prefilled initially
      // To auto-fetch coordinates for prefilled, you might need an extra step here
      // For now, it assumes prefill is just the string.
    }
  }, [])

  // NEW: Handling authentication status based on useSession
  if (authLoading) { // status === "loading"
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] text-[var(--color-primary)]">
        <span className="flex items-center justify-center text-lg">
          <svg
            className="animate-spin -ml-1 mr-3 h-6 w-6 text-[var(--color-accent1)]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading user session...
        </span>
      </div>
    )
  }

  if (!session) { // status === "unauthenticated"
    // NextAuth automatically redirects unauthenticated users if you have middleware configured.
    // However, explicitly showing this message or redirecting here is fine if you don't use middleware.
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] text-[var(--color-primary)] text-center p-4">
        <div>
          <p className="text-xl mb-4">Please login to create a trip.</p>
          <Button
            onClick={() => router.push("/auth/login?callbackUrl=/create-trip")}
            className="bg-[var(--color-btn)] hover:bg-[var(--color-accent1)] text-white"
          >
            Login
          </Button>
        </div>
      </div>
    )
  }

  // At this point, `session` exists, meaning the user is authenticated.
  // We can safely access `session.user.id`
  return (
    <div className="min-h-screen bg-[var(--color-bg)] relative py-12 px-4 sm:px-6">
      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="border border-[var(--color-accent1)]/30 bg-[var(--color-bg)]/50 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg p-6 sm:p-8 lg:p-12"
        >
          <div className="text-center mb-10">
            <motion.div
              className="w-16 h-16 mx-auto bg-gradient-to-br from-[var(--color-accent1)] to-[var(--color-accent2)] rounded-2xl flex items-center justify-center mb-4 shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Globe className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-light text-[var(--color-primary)] mb-2 tracking-tight">
              Plan Your Journey
            </h1>
            <p className="text-[var(--color-primary)]/80">Personalize your travel experience</p>
          </div>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            variants={formContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Title */}
            <motion.div variants={formItemVariants}>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Trip Title (e.g., Summer in Italy)"
                className="w-full px-4 py-3 border border-[var(--color-primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent1)]/50 focus:border-[var(--color-accent1)] transition-colors text-[var(--color-primary)] bg-transparent placeholder:text-[var(--color-primary)]/40"
              />
              {errors.title && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mt-1"
                >
                  {errors.title}
                </motion.p>
              )}
            </motion.div>

            {/* Destination */}
            <motion.div variants={formItemVariants} className="relative">
              <input
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value)
                  setDestinationLat(null)
                  setDestinationLng(null)
                  setShowSuggestions(true)
                  if (errors.destination) setErrors((e) => ({ ...e, destination: undefined }))
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Allow click on suggestion
                placeholder="Where to? (e.g., Rome, Italy)"
                className="w-full px-4 py-3 border border-[var(--color-primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent1)]/50 focus:border-[var(--color-accent1)] transition-colors text-[var(--color-primary)] bg-transparent placeholder:text-[var(--color-primary)]/40"
              />
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.ul
                    variants={suggestionsListVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute z-20 mt-1 w-full bg-[var(--color-bg)]/80 backdrop-blur-md rounded-md shadow-xl max-h-60 overflow-y-auto border border-[var(--color-primary)]/20"
                  >
                    {suggestions.map((s) => (
                      <li
                        key={s.place_id}
                        onMouseDown={() => handleSuggestionClick(s)} // Use onMouseDown to fire before blur
                        className="px-4 py-2.5 text-sm text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 cursor-pointer transition-colors"
                      >
                        {s.display_name}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
              {errors.destination && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mt-1"
                >
                  {errors.destination}
                </motion.p>
              )}
            </motion.div>

            {/* Dates */}
            <motion.div variants={formItemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border border-[var(--color-primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent1)]/50 focus:border-[var(--color-accent1)] transition-colors text-[var(--color-primary)] bg-transparent placeholder:text-[var(--color-primary)]/40 [color-scheme:dark]"
                min={new Date().toISOString().split("T")[0]} // Prevent selecting past dates
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border border-[var(--color-primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent1)]/50 focus:border-[var(--color-accent1)] transition-colors text-[var(--color-primary)] bg-transparent placeholder:text-[var(--color-primary)]/40 [color-scheme:dark]"
                min={startDate || new Date().toISOString().split("T")[0]} // End date cannot be before start date
              />
            </motion.div>

            {/* Interests */}
            <motion.div variants={formItemVariants}>
              <h3 className="text-sm text-[var(--color-primary)]/90 mb-3 font-medium">Interests (Optional)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {interestOptions.map((interest) => (
                  <motion.button
                    type="button"
                    key={interest.name}
                    onClick={() => handleInterestChange(interest.name)}
                    className={`px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium border flex items-center justify-center text-center transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent ${
                      selectedInterests.includes(interest.name)
                        ? "bg-[var(--color-accent1)] text-white border-[var(--color-accent1)] hover:bg-[var(--color-accent1)]/90 focus:ring-[var(--color-accent1)]"
                        : "bg-transparent text-[var(--color-primary)] border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)]/10 hover:border-[var(--color-primary)]/50 focus:ring-[var(--color-accent1)]/50"
                    }`}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="mr-1.5 sm:mr-2 text-base">{interest.icon}</span>
                    {interest.name}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Budget */}
            <motion.div variants={formItemVariants}>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Budget (USD, Optional)"
                min="0"
                className="w-full px-4 py-3 border border-[var(--color-primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent1)]/50 focus:border-[var(--color-accent1)] transition-colors text-[var(--color-primary)] bg-transparent placeholder:text-[var(--color-primary)]/40"
              />
            </motion.div>

            {/* General Error */}
            <AnimatePresence>
              {generalError && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded-md"
                >
                  {generalError}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.div variants={formItemVariants}>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--color-btn)] hover:bg-[var(--color-accent1)] text-white py-3.5 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 text-base"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating Trip...
                  </span>
                ) : (
                  "Create Trip"
                )}
              </Button>
            </motion.div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  )
}