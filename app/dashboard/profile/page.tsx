"use client"

import { useState, useEffect } from "react" // Import useEffect
import { motion } from "framer-motion"
import { User, Mail, Calendar, Camera, Save, Edit } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { useSession } from "next-auth/react" // Import useSession
import { useRouter } from "next/navigation" // Import useRouter for redirection

export default function ProfilePage() {
  const { data: session, status } = useSession() // Get session data and loading status
  const router = useRouter()

  // Initialize formData based on session user, or empty strings if not available yet
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
  })
  const [isEditing, setIsEditing] = useState(false)

  // Use useEffect to update formData when session data becomes available
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
      })
    } else if (status === "unauthenticated") {
      // Redirect to login if not authenticated
      router.push("/auth/login?callbackUrl=/dashboard/profile")
    }
  }, [session, status, router]) // Depend on session and status

  const getInitials = (name: string | null | undefined, email: string | null | undefined) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (email) {
      return email.slice(0, 2).toUpperCase()
    }
    return "??" // Fallback if both are null/undefined
  }

  const handleSave = async () => {
    // TODO: Implement profile update API. You'll need an API route
    // (e.g., /api/users/[userId]) that is protected by NextAuth
    // and updates the user's name/email in your database (Prisma).
    console.log("Saving changes:", formData);
    setIsEditing(false)
  }

  // Show a loading state while the session is being determined
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-bg p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-slate-900 mx-auto mb-4"></div>
          <p className="text-xl text-slate-600 font-medium">Loading profile...</p>
        </div>
      </div>
    )
  }

  // If unauthenticated, redirect logic in useEffect should handle this,
  // but as a fallback or explicit rendering during transition:
  if (status === "unauthenticated") {
    return null; // Or a simple message before redirect
  }

  // Once authenticated, render the profile page
  return (
    <div className="min-h-screen bg-bg p-8 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-primary">Profile Settings</h1>
        <p className="text-primary/70 mt-1">Manage your account information and preferences</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <Card className="border-0 shadow-sm bg-card-bg text-primary">
            <CardContent className="p-6 text-center">
              <div className="relative inline-block mb-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={session?.user?.image || "/placeholder.svg"} alt={session?.user?.name || session?.user?.email || ""} />
                  <AvatarFallback className="bg-gradient-to-r from-accent1 to-accent2 text-primary text-xl font-medium">
                    {session?.user && getInitials(session.user.name, session.user.email)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-btn border-2 border-primary/20 text-primary hover:text-white"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="text-xl font-semibold text-primary">{session?.user?.name || "Traveler"}</h3>
              <p className="text-primary/80">{session?.user?.email}</p>
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-primary/60">
                <Calendar className="h-4 w-4" />
                <span>Member since 2024</span> {/* Consider adding actual member since date if available */}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="border-0 shadow-sm bg-card-bg text-primary">
            <CardHeader className="flex flex-row items-center justify-between bg-card-header rounded-t-2xl px-6 py-4">
              <CardTitle className="text-xl font-semibold text-primary">Personal Information</CardTitle>
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 text-black border-btn hover:bg-btn hover:text-white"
              >
                <Edit className="h-4 w-4" />
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-label-text">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary/50" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10 bg-bg border-input-border text-input-text focus:ring-accent1 focus:border-accent1"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-label-text">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary/50" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10 bg-bg border-input-border text-input-text focus:ring-accent1 focus:border-accent1"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-3 pt-4 border-t border-btn">
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="text-black border-btn hover:bg-btn hover:text-white">
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="bg-gradient-to-r from-accent1 to-accent2 text-primary hover:from-accent2 hover:to-accent1">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Travel Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border-0 shadow-sm bg-card-bg text-primary">
          <CardHeader className="bg-card-header rounded-t-2xl px-6 py-4">
            <CardTitle className="text-xl font-semibold text-primary">Travel Statistics</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-stats-blue mb-2">0</div>
                <div className="text-sm text-primary/70">Countries Visited</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-stats-green mb-2">0</div>
                <div className="text-sm text-primary/70">Cities Explored</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-stats-purple mb-2">0</div>
                <div className="text-sm text-primary/70">Total Trips</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-stats-orange mb-2">0</div>
                <div className="text-sm text-primary/70">Days Traveled</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}