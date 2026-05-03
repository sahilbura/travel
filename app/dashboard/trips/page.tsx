"use client"

import { useState, useEffect, useCallback } from "react" // Import useCallback
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Calendar, MapPin, DollarSign, Plus, Eye, Clock, Globe, Search } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Card } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Input } from "@/app/components/ui/input"

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

export default function DashboardTripsPage() {
  const router = useRouter()
  const [trips, setTrips] = useState<Trip[]>([])
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "upcoming" | "ongoing" | "completed">("all")

  // Wrap filterTrips in useCallback
  const filterTrips = useCallback(() => {
    let filtered = trips

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (trip) =>
          trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          trip.destination.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Status filter
    if (filterStatus !== "all") {
      const now = new Date()
      filtered = filtered.filter((trip) => {
        const start = new Date(trip.startDate)
        const end = new Date(trip.endDate)

        switch (filterStatus) {
          case "upcoming":
            return now < start
          case "ongoing":
            return now >= start && now <= end
          case "completed":
            return now > end
          default:
            return true
        }
      })
    }

    setFilteredTrips(filtered)
  }, [trips, searchQuery, filterStatus]) // Dependencies for useCallback

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true)
      try {
        // Replace the URL with your actual API endpoint
        const response = await fetch("/api/trips")
        if (!response.ok) throw new Error("Failed to fetch trips")
        const data: Trip[] = await response.json()
        setTrips(data)
      } catch (error) {
        console.error("Error fetching trips:", error)
        setTrips([])
      } finally {
        setLoading(false)
      }
    }
    fetchTrips()
  }, [])

  useEffect(() => {
    filterTrips()
  }, [filterTrips]) // Now filterTrips is a dependency here

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getTripDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Updated to use the 5-color palette
  const getTripStatus = (startDate: string, endDate: string) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Using accent1 for upcoming, accent2 for ongoing, subtle primary for completed
    if (now < start) return { status: "upcoming", color: "bg-accent1/20 text-accent1" }
    if (now >= start && now <= end) return { status: "ongoing", color: "bg-accent2/20 text-accent2" }
    return { status: "completed", color: "bg-primary/5 text-primary/50" }
  }

  if (loading) {
    return (
      <div className="p-8 bg-bg min-h-screen"> {/* Apply bg-bg to the loading screen */}
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-primary/5 rounded w-1/4"></div> {/* Use primary/5 for loaders */}
          <div className="flex gap-4">
            <div className="h-10 bg-primary/5 rounded w-1/3"></div>
            <div className="h-10 bg-primary/5 rounded w-1/6"></div>
            <div className="h-10 bg-primary/5 rounded w-1/6"></div>
            <div className="h-10 bg-primary/5 rounded w-1/6"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-primary/5 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 bg-bg min-h-screen overflow-y-auto overflow-x-hidden"> {/* Main background */}
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">My Trips</h1> {/* Text primary */}
            <p className="text-primary/80 mt-1">Manage and explore your travel adventures</p> {/* Text primary/80 */}
          </div>
          <Button
            onClick={() => router.push("/dashboard/create-trip")}
            className="bg-btn text-primary shadow-lg hover:bg-btn/80 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Trip
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary/40" /> {/* Text primary/40 for search icon */}
          <Input
            placeholder="Search trips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-primary/5 text-primary border-primary/10 placeholder:text-primary/50" // Input styling
          />
        </div>
        <div className="flex gap-2">
          {["all", "upcoming", "ongoing", "completed"].map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "outline"}
              onClick={() => setFilterStatus(status as typeof filterStatus)}
              className={`capitalize 
                ${filterStatus === status ? 'bg-btn text-primary hover:bg-btn/80' : 'bg-transparent text-primary border border-primary/20 hover:bg-primary/10 hover:text-primary'}`}
            >
              {status}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Trips Grid */}
      <AnimatePresence>
        {filteredTrips.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredTrips.map((trip, index) => {
              const tripStatus = getTripStatus(trip.startDate, trip.endDate)
              return (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="group cursor-pointer"
                  onClick={() => router.push(`/trips/${trip.id}`)}
                >
                  <Card className="border-0 shadow-sm hover:shadow-xl transition-all duration-500 bg-primary/5 overflow-hidden h-full"> {/* Card background */}
                    {/* Trip Header */}
                    <div className="p-6 pb-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-primary mb-2 line-clamp-2 group-hover:text-primary/90 transition-colors"> {/* Primary text for title */}
                            {trip.title}
                          </h3>
                          <div className="flex items-center text-primary/70 mb-1"> {/* Primary/70 for destination text */}
                            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="text-sm font-medium truncate">{trip.destination}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <Badge className="bg-primary/10 text-primary/70 border-0 text-xs font-medium px-2 py-1"> {/* Duration badge */}
                            {getTripDuration(trip.startDate, trip.endDate)}d
                          </Badge>
                          <Badge className={`${tripStatus.color} border-0 capitalize text-xs px-2 py-1`}>
                            {tripStatus.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="flex items-center text-primary/60 mb-4"> {/* Primary/60 for dates */}
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="text-sm">
                          {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
                        </span>
                      </div>

                      {/* Interests */}
                      {trip.interests && trip.interests.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {trip.interests.slice(0, 2).map((interest, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs font-normal border-primary/10 text-primary/70 bg-primary/5" // Interests badges
                              >
                                {interest}
                              </Badge>
                            ))}
                            {trip.interests.length > 2 && (
                              <Badge
                                variant="outline"
                                className="text-xs font-normal border-primary/10 text-primary/70 bg-primary/5" // Interests badges
                              >
                                +{trip.interests.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Budget */}
                      {trip.budget !== null && (
                        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg mb-4"> {/* Budget background */}
                          <div className="flex items-center text-primary/70"> {/* Budget icon and text */}
                            <DollarSign className="h-4 w-4 mr-2" />
                            <span className="text-sm font-medium">Budget</span>
                          </div>
                          <span className="text-sm font-semibold text-primary">${trip.budget?.toLocaleString()}</span> {/* Budget amount */}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 pb-6">
                      <div className="flex items-center justify-between pt-4 border-t border-primary/10"> {/* Footer border */}
                        <div className="flex items-center text-primary/50 text-xs"> {/* Created at text */}
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(trip.createdAt)}
                        </div>

                        <div className="flex items-center text-primary/70 text-sm font-medium group-hover:text-primary transition-colors"> {/* View details link */}
                          View Details
                          <Eye className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center py-20 bg-primary/5 rounded-xl" // Empty state background
          >
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-bg rounded-2xl flex items-center justify-center mx-auto mb-6"> {/* Icon background */}
                <Globe className="h-8 w-8 text-primary/50" /> {/* Icon color */}
              </div>

              <h3 className="text-2xl font-semibold text-primary mb-3"> {/* Primary text for title */}
                {searchQuery || filterStatus !== "all" ? "No trips match your filters" : "No trips found"}
              </h3>

              <p className="text-primary/70 mb-8 leading-relaxed"> {/* Primary/70 for description */}
                {searchQuery || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Start planning your next adventure and create unforgettable memories."}
              </p>

              <Button
                onClick={() => router.push("/dashboard/create-trip")}
                // Gradient using accent2 and accent1, text primary
                className="bg-gradient-to-r from-accent2 to-accent1 hover:from-accent2/90 hover:to-accent1/90 text-primary shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                {searchQuery || filterStatus !== "all" ? "Create New Trip" : "Plan Your First Trip"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}