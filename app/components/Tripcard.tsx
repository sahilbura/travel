import { MapPin, Clock, Eye } from "lucide-react"
import { motion } from "framer-motion"
import { Badge } from "@/app/components/ui/badge"

interface TripCardProps {
  title: string
  destination: string
  startDate: string
  endDate: string
  coverImage?: string
  status: "upcoming" | "ongoing" | "completed"
  onClick: () => void
}

const statusStyles: Record<string, string> = {
  upcoming: "bg-gradient-to-r from-[#FFE8CD] to-[#FFD6BA] text-[#C18C5D]",
  ongoing: "bg-gradient-to-r from-[#FFD6BA] to-[#FFB88C] text-[#B97C5D]",
  completed: "bg-gradient-to-r from-[#F5F5F5] to-[#E0E0E0] text-[#424242]",
}

export const TripCard = ({
  title,
  destination,
  startDate,
  coverImage,
  status,
  onClick,
}: TripCardProps) => {
  const imageUrl = coverImage || "/default-trip.jpg"

  return (
    <motion.div
      className="relative h-80 rounded-2xl overflow-hidden cursor-pointer bg-cover bg-center group"
      style={{
        backgroundImage: `url('${imageUrl}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -8 }}
      onClick={onClick}
    >
      {/* Enhanced glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20 group-hover:from-black/50 group-hover:via-black/20 group-hover:to-black/10 transition-all duration-300" />
      
      {/* Shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white to-transparent transform group-hover:-translate-x-full" style={{animation: "shimmer 2s infinite"}} />

      {/* Shadow enhancement */}
      <div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.3)] group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-1px_0_rgba(0,0,0,0.4)] rounded-2xl transition-all duration-300" />

      {/* Content */}
      <div className="relative z-10 h-full p-6 text-white flex flex-col justify-between">
        {/* Top Info */}
        <div className="space-y-3">
          <motion.h3 
            className="font-bold text-2xl group-hover:text-yellow-300 transition-colors duration-300"
            whileHover={{ scale: 1.05 }}
          >
            {title}
          </motion.h3>
          <div className="space-y-2">
            <p className="text-sm flex items-center gap-2 flex-wrap text-white/90 group-hover:text-white transition-colors">
              <MapPin className="h-4 w-4 text-yellow-300" />
              {destination}
            </p>
            <p className="text-sm flex items-center gap-2 text-white/80 group-hover:text-white/90 transition-colors">
              <Clock className="h-4 w-4 text-yellow-300" />
              {new Date(startDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
              })}
            </p>
          </div>
        </div>

        {/* Bottom Info */}
        <motion.div 
          className="flex items-center justify-between"
          whileHover={{ scale: 1.05 }}
        >
          <Badge className={`${statusStyles[status]} border-0 capitalize px-3 py-1 text-xs font-semibold shadow-lg`}>
            {status}
          </Badge>
          <motion.div
            className="text-white/70 group-hover:text-yellow-300 transition-colors"
            whileHover={{ scale: 1.2, rotate: 10 }}
          >
            <Eye className="h-5 w-5" />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
