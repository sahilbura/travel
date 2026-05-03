"use client"

import { useState, useEffect, useCallback } from "react" // Import useCallback
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import Image from "next/image"

interface CarouselSlide {
  title: string
  button: string
  src: string
}

interface CarouselProps {
  slides: CarouselSlide[]
  isOpen?: boolean
  onClose?: () => void
}

export default function Carousel({ slides, isOpen = true, onClose }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Wrap these functions in useCallback to ensure they are stable
  // and only re-created if their dependencies change.
  // In this case, their dependencies (setCurrentIndex, slides.length) are stable.
  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length)
  }, [slides.length]) // slides.length can change if `slides` prop changes

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length)
  }, [slides.length]) // slides.length can change if `slides` prop changes

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        prevSlide()
      } else if (event.key === "ArrowRight") {
        nextSlide()
      } else if (event.key === "Escape" && onClose) {
        onClose()
      }
    }

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
      // Add prevSlide, nextSlide, and onClose to the dependency array
      // This ensures the effect re-runs if these functions change (though unlikely for state setters)
      // or if the onClose prop changes.
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, prevSlide, nextSlide, onClose]) // Dependencies added here

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
      )}

      <div className="relative w-full max-w-4xl mx-auto px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <Image
              src={slides[currentIndex].src || "/placeholder.svg"}
              width={800}
              height={600}
              alt={slides[currentIndex].title}
              className="w-full h-[70vh] object-cover rounded-lg"
            />

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
              <h2 className="text-2xl font-bold text-white mb-2">{slides[currentIndex].title}</h2>
              <Button className="bg-white text-black hover:bg-gray-200">{slides[currentIndex].button}</Button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
          onClick={nextSlide}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-white" : "bg-white/50"
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}