"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Calendar, MapPin, Plus, TrendingUp, DollarSign, Plane, ArrowRight } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent } from "@/app/components/ui/card"
import { destinationsService } from "@/lib/destinations-service"
import { TripCard } from "@/app/components/Tripcard"
import { useSession } from "next-auth/react" // Import useSession from next-auth/react

interface Trip {
  id: string
  title: string
  destination: string
  startDate: string
  endDate: string
  interests: string[]
  budget: number | null
  createdAt: string
  coverImage?: string
}

interface DashboardStats {
  totalTrips: number
  upcomingTrips: number
  totalBudget: number
  favoriteDestination: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [recentTrips, setRecentTrips] = useState<Trip[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalTrips: 0,
    upcomingTrips: 0,
    totalBudget: 0,
    favoriteDestination: "Not set",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only fetch data if the session is loaded and a user is present
    if (status === "authenticated") {
      fetchDashboardData()
    } else if (status === "unauthenticated") {
      // Redirect to login if not authenticated
      router.push("/auth/login?callbackUrl=/dashboard")
    }
  }, [status, router]) // Depend on status to re-run when session changes

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/trips")
      if (response.ok) {
        const data = await response.json()
        const allTrips: Trip[] = data.trips || []

        const tripsToDisplay = allTrips.slice(0, 3)
        const enrichedRecentTrips = await Promise.all(
          tripsToDisplay.map(async (trip) => {
            try {
              const photos = await destinationsService.searchPhotos(trip.destination, 1)
              return {
                ...trip,
                coverImage: photos[0]?.src.large || "/default-trip.jpg",
              }
            } catch (photoError) {
              console.error("Error fetching photo for", trip.destination, photoError)
              return {
                ...trip,
                coverImage: "/default-trip.jpg", // Fallback if photo service fails
              }
            }
          })
        )
        setRecentTrips(enrichedRecentTrips)

        const now = new Date()
        const upcoming = allTrips.filter((trip: Trip) => new Date(trip.startDate) > now)
        const totalBudget = allTrips.reduce((sum: number, trip: Trip) => sum + (trip.budget || 0), 0)

        let favoriteDest = "Not set"
        if (allTrips.length > 0) {
          // You might want to implement a more robust "favorite" logic here, e.g., most visited
          favoriteDest = allTrips[0].destination
        }

        setStats({
          totalTrips: allTrips.length,
          upcomingTrips: upcoming.length,
          totalBudget,
          favoriteDestination: favoriteDest,
        })
      } else {
        console.error("Failed to fetch trips data:", response.statusText)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTripStatus = (startDate: string, endDate: string) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (now < start) return { status: "upcoming", color: "bg-accent1/20 text-accent1" }
    if (now >= start && now <= end) return { status: "ongoing", color: "bg-accent2/20 text-accent2" }
    return { status: "completed", color: "bg-primary/5 text-primary/50" }
  }

  // Handle loading state while session is being determined
  if (status === "loading" || loading) {
    return (
      <div className="p-8 bg-bg min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-primary/5 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-primary/5 rounded-lg"></div>
            ))}
          </div>
          <div className="h-8 bg-primary/5 rounded w-1/3 mt-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-80 bg-primary/5 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // If unauthenticated, redirect logic in useEffect should handle this,
  // but as a fallback or explicit rendering during transition:
  if (status === "unauthenticated") {
    return null; // Or a simple loading spinner/message before redirect
  }

  return (
    <div className="p-8 space-y-8 bg-bg min-h-screen overflow-y-auto overflow-x-hidden">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent1)] bg-clip-text text-transparent">
              Welcome back, {session?.user?.name || "Traveler"}! 👋
            </h1>
            <p className="text-primary/80 mt-2 text-lg">Here&apos;s what&apos;s happening with your travels</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => router.push("/dashboard/create-trip")}
              className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-semibold shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Trip
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Total Trips Card */}
        <motion.div
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="border-0 shadow-lg hover:shadow-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">Total Trips</p>
                  <p className="text-4xl font-bold text-blue-900 dark:text-blue-200 mt-2">{stats.totalTrips}</p>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">adventures completed</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Trips Card */}
        <motion.div
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, delay: 0.05 }}
        >
          <Card className="border-0 shadow-lg hover:shadow-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/10 rounded-xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">Upcoming</p>
                  <p className="text-4xl font-bold text-purple-900 dark:text-purple-200 mt-2">{stats.upcomingTrips}</p>
                  <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">planned ahead</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Budget Card */}
        <motion.div
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg hover:shadow-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 rounded-xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">Total Budget</p>
                  <p className="text-4xl font-bold text-green-900 dark:text-green-200 mt-2">${stats.totalBudget.toLocaleString()}</p>
                  <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">allocated</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Favorite Destination Card */}
        <motion.div
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, delay: 0.15 }}
        >
          <Card className="border-0 shadow-lg hover:shadow-2xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/10 rounded-xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">Favorite</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-200 mt-2 break-words max-w-[180px] truncate" title={stats.favoriteDestination}>
                    {stats.favoriteDestination}
                  </p>
                  <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1">destination</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Recent Trips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent1)] bg-clip-text text-transparent">Recent Trips</h2>
            </motion.div>
            {recentTrips.length > 0 && (
              <motion.div
                whileHover={{ x: 5 }}
              >
                <Button
                  variant="ghost"
                  onClick={() => router.push("/dashboard/trips")}
                  className="text-[var(--color-accent1)] hover:bg-[var(--color-accent1)]/10 font-semibold"
                >
                  View all
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </div>

          {recentTrips.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {recentTrips.map((trip, index) => {
                const tripStatus = getTripStatus(trip.startDate, trip.endDate).status as "upcoming" | "ongoing" | "completed";

                return (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <TripCard
                      title={trip.title}
                      destination={trip.destination}
                      startDate={trip.startDate}
                      endDate={trip.endDate}
                      coverImage={trip.coverImage}
                      status={tripStatus}
                      onClick={() => router.push(`/trips/${trip.id}`)}
                    />
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <motion.div 
              className="text-center py-16 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-2xl border-2 border-dashed border-[var(--color-accent1)]/30"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div 
                className="w-20 h-20 bg-gradient-to-br from-[var(--color-accent1)] to-[var(--color-accent2)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                whileHover={{ scale: 1.1, rotate: 10 }}
              >
                <Plane className="h-10 w-10 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-[var(--color-primary)] mb-2">No trips yet</h3>
              <p className="text-[var(--color-primary)]/70 mb-8 text-lg">Start planning your first adventure today!</p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => router.push("/dashboard/create-trip")}
                  className="bg-gradient-to-r from-[var(--color-accent1)] to-[var(--color-accent2)] hover:from-[var(--color-accent1)]/80 hover:to-[var(--color-accent2)]/80 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Trip
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}