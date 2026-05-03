"use client"

import { format } from "date-fns"
import type { Day, Activity, Trip } from "@/app/generated/prisma"
import { useRouter } from "next/navigation"
import { useState, useEffect, useCallback } from "react" // Import useCallback
import { motion, AnimatePresence } from "framer-motion"
import { useParams } from "next/navigation"
import {
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  ArrowLeft,
  Plane,
  Star,
  Navigation,
  Coffee,
  Camera,
  Heart,
  Zap,
} from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"

// Define a type that matches the structure of trip with included days and activities
type TripWithDetails = Trip & {
  days: (Day & { activities: Activity[] })[]
}

const activityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  restaurant: Coffee,
  attraction: Camera,
  hotel: Heart,
  transport: Navigation,
  shopping: Star,
  default: Sparkles,
}

const activityColors: Record<string, string> = {
  // These remain direct Tailwind gradient classes.
  // If you wanted these to be custom color variables,
  // you'd define gradient stops in tailwind.config.js as well.
  restaurant: "from-orange-400 to-red-400",
  attraction: "from-rose-400 to-red-400",
  hotel: "from-pink-400 to-rose-400",
  transport: "from-amber-400 to-orange-400",
  shopping: "from-yellow-400 to-amber-400",
  default: "from-stone-400 to-stone-500",
}

export default function TripPage() {
  const params = useParams<{ tripId: string }>()
  const router = useRouter()
  const tripId = params.tripId
  const [trip, setTrip] = useState<TripWithDetails | null>(null)
  const [loadingTrip, setLoadingTrip] = useState(true)
  const [loadingItinerary, setLoadingItinerary] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Function to fetch trip data from your API route
  // Wrap fetchTrip in useCallback
  const fetchTrip = useCallback(async () => {
    setLoadingTrip(true)
    setError(null)
    try {
      const response = await fetch(`/api/trips/${tripId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch trip details")
      }
      const data = await response.json()
      setTrip(data.trip)
    } catch (err: unknown) {
      console.error("Error fetching trip:", err)
      const errorMessage =
        typeof err === "object" && err !== null && "message" in err
          ? (err as { message: string }).message
          : String(err)
      setError(errorMessage || "Failed to load trip.")
    } finally {
      setLoadingTrip(false)
    }
  }, [tripId]) // tripId is a dependency for fetchTrip

  useEffect(() => {
    if (tripId) {
      fetchTrip()
    }
  }, [tripId, fetchTrip]) // Now fetchTrip is correctly included here

  const handleGenerateItinerary = async () => {
    setLoadingItinerary(true)
    setError(null)
    try {
      const response = await fetch(`/api/trips/${tripId}/generate-itinerary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to generate itinerary")
      }

      // Re-fetch the trip to display the newly generated itinerary
      await fetchTrip() // fetchTrip is called here, its stability is important
    } catch (err: unknown) {
      console.error("Error generating itinerary:", err)
      const errorMessage =
        typeof err === "object" && err !== null && "message" in err
          ? (err as { message: string }).message
          : String(err)
      setError(errorMessage || "An error occurred during itinerary generation.")
    } finally {
      setLoadingItinerary(false)
    }
  }

  const getActivityIcon = (type: string) => {
    const IconComponent = activityIcons[type.toLowerCase()] || activityIcons.default
    return IconComponent
  }

  const getActivityColor = (type: string) => {
    return activityColors[type.toLowerCase()] || activityColors.default
  }

  if (loadingTrip) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-xl text-primary font-medium">Loading your adventure...</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 bg-card-bg rounded-2xl shadow-xl"
        >
          <div className="text-error-red text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-primary mb-2">Oops! Something went wrong</h2>
          <p className="text-error-red mb-6">{error}</p>
          <Button onClick={() => router.back()} variant="outline" className="text-primary hover:bg-btn border-btn">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </motion.div>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 bg-card-bg rounded-2xl shadow-xl"
        >
          <div className="text-primary opacity-60 text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-primary mb-2">Trip Not Found</h2>
          <p className="text-primary opacity-80 mb-6">The trip you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.back()} variant="outline" className="text-primary hover:bg-btn border-btn">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg py-8 px-4">
      <div className="w-[85vw] mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6 hover:bg-btn text-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Trips
          </Button>

          <div className="bg-card-bg w-full rounded-2xl shadow-sm p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, ease: "backOut" }}
                className="bg-gradient-to-r from-primary to-accent1 p-3 rounded-full shadow-lg"
              >
                <Plane className="h-6 w-6 text-bg" />
              </motion.div>
            </div>

            <h1 className="text-4xl lg:text-5xl text-primary font-bold bg-gradient-to-r from-primary via-accent1 to-accent2 bg-clip-text mb-4">
              {trip.title}
            </h1>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-primary opacity-90">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent1" />
                <span className="font-medium">{trip.destination}</span>
              </div>
              <div className="hidden md:block w-1 h-1 bg-primary opacity-30 rounded-full"></div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-accent1" />
                <span className="font-medium">
                  {format(new Date(trip.startDate), "PPP")} - {format(new Date(trip.endDate), "PPP")}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Generate Itinerary Section */}
        {trip.days.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-card-bg rounded-2xl shadow-sm p-8 text-center">
              <div className="mb-6">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-2xl font-bold text-primary mb-2">Ready to Plan Your Adventure?</h3>
                <p className="text-primary opacity-90 text-lg">
                  Let our AI create a personalized itinerary based on your preferences and destination.
                </p>
              </div>

              <Button
                onClick={handleGenerateItinerary}
                disabled={loadingItinerary}
                className="bg-accent1 hover:bg-accent2 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loadingItinerary ? (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Generating Your Perfect Itinerary...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5" />
                    Generate Itinerary with AI
                    <Sparkles className="h-5 w-5" />
                  </div>
                )}
              </Button>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-error-red mt-4 font-medium"
                >
                  {error}
                </motion.p>
              )}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {trip.days.length === 0 && !loadingItinerary && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="bg-card-bg rounded-2xl border border-btn p-8 text-center">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-primary mb-2">No Itinerary Yet</h3>
              <p className="text-primary opacity-90">
                Your adventure awaits! Generate an AI-powered itinerary to get started.
              </p>
            </div>
          </motion.div>
        )}

        {/* Itinerary Days */}
        <AnimatePresence>
          {trip.days.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-accent1 to-accent2 bg-clip-text text-transparent mb-2">
                  Your Itinerary
                </h2>
                <p className="text-primary opacity-90">Every moment planned to perfection</p>
              </div>

              {trip.days.map((day: Day & { activities: Activity[] }, index: number) => (
                <motion.div
                  key={day.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="bg-card-bg rounded-2xl shadow-sm overflow-hidden">
                    {/* Day Header */}
                    <div className="bg-card-header px-6 py-4 border-b border-btn">
                      <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-r from-accent1 to-accent2 text-bg rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {day.dayIndex + 1}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-primary">Day {day.dayIndex + 1}</h3>
                          <p className="text-primary flex items-center gap-2 text-sm opacity-90">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(day.date), "PPP")}
                          </p>
                        </div>
                      </div>
                      {day.summary && (
                        <p className="text-primary mt-3 p-3 bg-bg/80 rounded-lg italic text-sm">
                          {day.summary}
                        </p>
                      )}
                    </div>

                    {/* Activities */}
                    <div className="p-6">
                      {day.activities.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="text-4xl mb-4">🌟</div>
                          <p className="text-primary opacity-70 text-lg">
                            No activities planned for this day yet.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {day.activities.map((activity: Activity, activityIndex: number) => {
                            const IconComponent = getActivityIcon(activity.type ?? "default")
                            const colorClass = getActivityColor(activity.type ?? "default")

                            return (
                              <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: activityIndex * 0.1 }}
                                className="flex gap-3 p-4 bg-bg rounded-xl hover:bg-neutral-800 transition-all duration-200"
                              >
                                {/* Compact Icon */}
                                <div
                                  className={`bg-gradient-to-r ${colorClass} w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm`}
                                >
                                  <IconComponent className="h-4 w-4 text-white" />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between mb-1">
                                    <h4 className="font-semibold text-primary text-base leading-tight">
                                      {activity.name}
                                    </h4>
                                    <Badge
                                      variant="outline"
                                      className="ml-2 bg-bg border-btn text-primary opacity-90 text-xs px-2 py-0.5 flex-shrink-0"
                                    >
                                      {activity.type}
                                    </Badge>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-3 text-xs text-primary opacity-90 mb-2">
                                    {activity.time && (
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span className="font-medium">{activity.time}</span>
                                      </div>
                                    )}

                                    {activity.address && (
                                      <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        <span className="truncate">{activity.address}</span>
                                      </div>
                                    )}

                                    {activity.budget !== null && (
                                      <div className="flex items-center gap-1">
                                        <span className="font-bold text-btn">${activity.budget.toLocaleString()}</span>
                                      </div>
                                    )}
                                  </div>

                                  {activity.description && (
                                    <p className="text-primary text-sm leading-relaxed mb-2">
                                      {activity.description}
                                    </p>
                                  )}

                                  {activity.notes && (
                                    <div className="bg-accent2/20 border border-accent2/50 rounded-lg p-2 mt-2">
                                      <div className="flex items-center gap-1">
                                        <Star className="h-3 w-3 text-accent2" />
                                        <span className="font-medium text-accent2 text-xs">Note:</span>
                                      </div>
                                      <p className="text-accent2 text-xs mt-1">{activity.notes}</p>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}