"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { MapPin, Clock, DollarSign, Star, Camera, ExternalLink } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import type { Destination } from "@/lib/destinations-service"
import Carousel from "@/app/components/ui/carousel"
import { DirectionAwareHover } from "@/app/components/ui/direction-aware-hover"

type CarouselSlide = {
  title: string
  button: string
  src: string
}

export default function PopularDestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [isCarouselOpen, setIsCarouselOpen] = useState(false)
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>([])

  const fetchDestinations = async () => {
    try {
      const response = await fetch("/api/destinations?category=popular")
      if (response.ok) {
        const data = await response.json()
        console.log("API data:", data)
        setDestinations(data.destinations);

        (data.destinations as Destination[]).forEach((d: Destination, i: number) =>
          console.log(`Destination ${i}:`, d),
        )
      }
    } catch (error) {
      console.error("Error fetching destinations:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      await fetchDestinations()
    }
    fetchData()
  }, [])

  useEffect(() => {
    document.body.style.setProperty("background-color", "var(--color-bg)")
    return () => {
      document.body.style.removeProperty("background-color")
    }
  }, [])

  const openCarousel = (destination: Destination) => {
    const slides = destination.photos.map((photo) => ({
      title: `${destination.name}, ${destination.country}`,
      button: "Plan Your Trip",
      src: photo.src.large || photo.src.medium || "/placeholder.svg",
    }))
    setCarouselSlides(slides)
    setIsCarouselOpen(true)
  }

  const closeCarousel = () => {
    setIsCarouselOpen(false)
    setCarouselSlides([])
  }

  if (loading) {
    return (
      <div className="relative top-[650px] min-h-screen bg-[var(--color-bg)] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-12">
            <div className="text-center space-y-4">
              <div className="h-12 bg-[var(--color-primary)]/10 rounded-lg w-1/3 mx-auto"></div>
              <div className="h-6 bg-[var(--color-primary)]/10 rounded w-1/2 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-[var(--color-primary)]/10 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="relative top-[650px] min-h-screen bg-[var(--color-bg)] p-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
            <h1 className="text-5xl font-light text-[var(--color-primary)] tracking-tight">
              Popular{" "}
              <span className="bg-gradient-to-r from-[var(--color-accent1)] to-[var(--color-accent2)] bg-clip-text text-transparent font-medium">
                Destinations
              </span>
            </h1>
            <p className="text-xl text-[var(--color-primary)]/80 max-w-3xl mx-auto leading-relaxed">
              Most visited destinations around the world
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {destinations.map((destination, index) => (
              <motion.div
                key={destination.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -12, scale: 1.02 }}
                className="transform transition-all duration-300 h-full"
              >
                <Card className="relative border border-[var(--color-accent1)]/30 bg-gradient-to-br from-[var(--color-bg)]/80 to-[var(--color-bg)]/50 backdrop-blur-xl rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col h-full hover:border-[var(--color-accent1)] group">
                  {destination.photos.length > 0 ? (
                    <div className="relative overflow-hidden">
                      <DirectionAwareHover
                        imageUrl={destination.photos[0].src.large || "/images/placeholder.png"}
                        className="w-full h-40 cursor-pointer"
                        imageClassName="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        childrenClassName="flex flex-col items-start justify-end p-4"
                      >
                        <motion.div 
                          className="text-white w-full"
                          initial={{ opacity: 0, y: 10 }}
                          whileHover={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <h3 className="text-2xl font-bold mb-1">{destination.name}</h3>
                          <p className="text-sm text-white/90 mb-3 flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {destination.country}
                          </p>
                          {destination.photos[0]?.photographer && (
                            <a
                              href={destination.photos[0].photographer_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-white/70 hover:text-white flex items-center gap-1 mb-3 transition-colors"
                            >
                              Photo by {destination.photos[0].photographer}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              openCarousel(destination)
                            }}
                            className="bg-white/30 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-2 hover:bg-white/50 transition-all text-white text-xs font-semibold shadow-lg"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Camera className="h-4 w-4" />
                            <span>View {destination.photos.length} photos</span>
                          </motion.button>
                        </motion.div>
                      </DirectionAwareHover>

                      <motion.div 
                        className="absolute top-4 left-4 z-10"
                        whileHover={{ scale: 1.1 }}
                      >
                        <Badge className="bg-gradient-to-r from-[var(--color-accent1)] to-[var(--color-accent2)] text-white border-0 capitalize shadow-lg">
                          <Star className="h-4 w-4" />
                          <span className="ml-1">{destination.category}</span>
                        </Badge>
                      </motion.div>
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-[var(--color-bg)] to-[var(--color-accent1)]/10 flex items-center justify-center group-hover:from-[var(--color-accent1)]/5">
                      <MapPin className="h-12 w-12 text-[var(--color-primary)]/50 group-hover:text-[var(--color-accent1)] transition-colors" />
                    </div>
                  )}

                  <CardContent className="p-6 flex flex-col justify-between flex-grow space-y-4">
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <p className="text-[var(--color-primary)]/80 leading-relaxed text-sm">{destination.description}</p>
                    </motion.div>

                    <motion.div 
                      className="space-y-3"
                      initial={{ opacity: 0, y: 5 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h4 className="font-semibold text-[var(--color-primary)] flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        Top Attractions
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {destination.attractions.slice(0, 3).map((attraction, idx) => (
                          <motion.div
                            key={idx}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Badge 
                              variant="outline" 
                              className="text-xs bg-gradient-to-r from-[var(--color-bg)] to-[var(--color-accent1)]/5 text-[var(--color-primary)] border border-[var(--color-accent1)]/40 hover:border-[var(--color-accent1)] transition-colors cursor-pointer"
                            >
                              {attraction}
                            </Badge>
                          </motion.div>
                        ))}
                        {destination.attractions.length > 3 && (
                          <Badge 
                            variant="outline" 
                            className="text-xs bg-[var(--color-bg)] text-[var(--color-primary)] border border-[var(--color-accent1)]/40"
                          >
                            +{destination.attractions.length - 3}
                          </Badge>
                        )}
                      </div>
                    </motion.div>

                    <motion.div 
                      className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--color-primary)]/10"
                      initial={{ opacity: 0, y: 5 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <motion.div 
                        className="space-y-2 p-3 rounded-lg bg-[var(--color-accent1)]/5 hover:bg-[var(--color-accent1)]/10 transition-colors"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="flex items-center gap-2 text-[var(--color-primary)]">
                          <Clock className="h-4 w-4 text-[var(--color-accent1)]" />
                          <span className="text-xs font-semibold">Best Time</span>
                        </div>
                        <p className="text-xs text-[var(--color-primary)]/80">{destination.bestTime}</p>
                      </motion.div>
                      <motion.div 
                        className="space-y-2 p-3 rounded-lg bg-[var(--color-accent1)]/5 hover:bg-[var(--color-accent1)]/10 transition-colors"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="flex items-center gap-2 text-[var(--color-primary)]">
                          <DollarSign className="h-4 w-4 text-[var(--color-accent1)]" />
                          <span className="text-xs font-semibold">Budget</span>
                        </div>
                        <p className="text-xs text-[var(--color-primary)]/80">{destination.budget}</p>
                      </motion.div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full"
                    >
                      <Button
                        className="w-full bg-gradient-to-r from-[var(--color-accent1)] to-[var(--color-accent2)] hover:from-[var(--color-accent1)]/80 hover:to-[var(--color-accent2)]/80 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                        onClick={() => {
                          window.location.href = `/create-trip?destination=${encodeURIComponent(
                            destination.name + ", " + destination.country,
                          )}`
                        }}
                      >
                        Plan Your Trip
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {isCarouselOpen && carouselSlides.length > 0 && (
        <Carousel slides={carouselSlides} isOpen={isCarouselOpen} onClose={closeCarousel} />
      )}
    </>
  )
}