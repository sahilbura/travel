"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Calendar, MapPin, DollarSign, Plane, Plus, Eye, ArrowLeft, Clock, Globe } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Card } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
// REMOVED: import { useAuth } from "@/contexts/auth-context"
import { useSession } from "next-auth/react" // NEW: Import useSession from next-auth/react

// Define the Trip interface based on your Prisma schema/API response
interface Trip {
  id: string
  title: string
  destination: string
  startDate: string
  endDate: string
  interests: string[]
  budget: number | null
  userId: string
  createdAt: string
  updatedAt: string
}

export default function TripsPage() {
  const router = useRouter()

  // State for fetching trips by user ID
  const [userTrips, setUserTrips] = useState<Trip[]>([])

  // State for UI feedback
  const [loading, setLoading] = useState(false) // For fetching trips

  // NEW: Use useSession hook from next-auth/react
  const { data: session, status } = useSession()
  const user = session?.user // Get user data from session
  const authLoading = status === "loading" // NextAuth's loading status

  // Function to format dates for display
  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Function to calculate trip duration
  const getTripDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Function to fetch trips for the specified user ID
  const fetchTrips = async () => {
    setLoading(true)
    try {
      // The API route /api/trips should ideally filter by authenticated user ID on the server
      // If it's already doing that based on session, you don't need to pass userId explicitly here.
      // However, if your /api/trips expects a userId query param, pass it:
      // const response = await fetch(`/api/trips?userId=${user?.id}`)
      const response = await fetch(`/api/trips`) // Assuming your API route handles user ID from session
      const data = await response.json()

      if (response.ok) {
        setUserTrips(data.trips)
      } else {
        // Handle specific errors from API if needed, e.g., if user has no trips
        setUserTrips([])
        console.error("API error fetching trips:", data.message || "Unknown error")
      }
    } catch (error: unknown) {
      console.error("Error fetching trips:", error)
      setUserTrips([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch trips on component mount and when user's authentication status changes to authenticated
  useEffect(() => {
    // Only fetch trips if the user is authenticated (status is "authenticated")
    if (status === "authenticated" && user?.id) {
      fetchTrips()
    }
  }, [status, user?.id]) // Depend on status and user.id

  const handleViewTrip = (tripId: string) => {
    router.push(`/trips/${tripId}`)
  }

  const handleCreateTrip = () => {
    router.push("/create-trip")
  }

  // NEW: Handling authentication status based on useSession
  if (authLoading) { // status === "loading"
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-slate-900 mx-auto mb-4"></div>
          <p className="text-xl text-slate-600 font-medium">Loading user session...</p>
        </div>
      </div>
    )
  }

  if (!session) { // status === "unauthenticated"
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Plane className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-3">Authentication Required</h2>
          <p className="text-slate-600 mb-8">Please log in to view your trips.</p>
          <Button
            onClick={() => router.push("/auth/login?callbackUrl=/trips")}
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-medium"
          >
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  // If we reach here, the user is authenticated (status === "authenticated") and session is available.
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(148,163,184,0.15)_1px,transparent_0)] [background-size:24px_24px]"></div>

      <div className="relative">
        {/* Navigation */}
        <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 -ml-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <Button
                onClick={handleCreateTrip}
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Trip
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl mb-6">
              <Globe className="h-8 w-8 text-white" />
            </div>

            <h1 className="text-4xl lg:text-5xl font-light text-slate-900 mb-4 tracking-tight">Your Journeys</h1>

            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Explore your travel collection and discover new destinations
            </p>
          </motion.div>

          {/* Trips Grid */}
          <AnimatePresence>
            {loading ? ( // Show loading spinner while fetching trips
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-slate-900 mx-auto mb-4"></div>
                    <p className="text-xl text-slate-600 font-medium">Loading your trips...</p>
                </div>
            ) : userTrips.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8"
              >
                {userTrips.map((trip, index) => (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="group cursor-pointer"
                    onClick={() => handleViewTrip(trip.id)}
                  >
                    <Card className="border-0 shadow-sm hover:shadow-xl transition-all duration-500 bg-white overflow-hidden h-full">
                      {/* Trip Header */}
                      <div className="p-8 pb-6">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-slate-700 transition-colors">
                              {trip.title}
                            </h3>
                            <div className="flex items-center text-slate-600 mb-1">
                              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span className="text-sm font-medium truncate">{trip.destination}</span>
                            </div>
                          </div>

                          <Badge className="bg-slate-100 text-slate-700 border-0 text-xs font-medium px-3 py-1 ml-4 flex-shrink-0">
                            {getTripDuration(trip.startDate, trip.endDate)}d
                          </Badge>
                        </div>

                        {/* Dates */}
                        <div className="flex items-center text-slate-500 mb-6">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="text-sm">
                            {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
                          </span>
                        </div>

                        {/* Interests */}
                        {trip.interests && trip.interests.length > 0 && (
                          <div className="mb-6">
                            <div className="flex flex-wrap gap-2">
                              {trip.interests.slice(0, 3).map((interest, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs font-normal border-slate-200 text-slate-600 bg-slate-50/50"
                                >
                                  {interest}
                                </Badge>
                              ))}
                              {trip.interests.length > 3 && (
                                <Badge
                                  variant="outline"
                                  className="text-xs font-normal border-slate-200 text-slate-500 bg-slate-50/50"
                                >
                                  +{trip.interests.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Budget */}
                        {trip.budget !== null && (
                          <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-lg mb-6">
                            <div className="flex items-center text-slate-600">
                              <DollarSign className="h-4 w-4 mr-2" />
                              <span className="text-sm font-medium">Budget</span>
                            </div>
                            <span className="text-lg font-semibold text-slate-900">
                              ${trip.budget?.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="px-8 pb-8">
                        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                          <div className="flex items-center text-slate-400 text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(trip.createdAt)}
                          </div>

                          <div className="flex items-center text-slate-600 text-sm font-medium group-hover:text-slate-900 transition-colors">
                            View Details
                            <Eye className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : ( // No trips found OR still loading trips
              !loading && ( // Only show "No trips" if not currently loading
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center py-20"
                >
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Plane className="h-8 w-8 text-slate-400" />
                    </div>

                    <h3 className="text-2xl font-semibold text-slate-900 mb-3">No trips found</h3>

                    <p className="text-slate-600 mb-8 leading-relaxed">
                      Start planning your next adventure and create unforgettable memories.
                    </p>

                    <Button
                      onClick={handleCreateTrip}
                      className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Plan Your First Trip
                    </Button>
                  </div>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}