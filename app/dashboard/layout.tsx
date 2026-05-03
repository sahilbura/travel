"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useSession } from "next-auth/react" // Import useSession
import { DashboardSidebar } from "@/app/components/dashboard/dashboard-sidebar"
import { SidebarProvider, SidebarInset } from "@/app/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { status } = useSession() // Get session data and status
  const router = useRouter()

  useEffect(() => {
    // If the session status is 'unauthenticated', redirect to login
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/dashboard")
    }
  }, [status, router]) // Depend on status to react to auth state changes

  // Show a loading spinner while NextAuth is checking the session status
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-slate-900 mx-auto mb-4"></div>
          <p className="text-xl text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  // If status is 'unauthenticated', we've already redirected in useEffect,
  // so we can return null here to avoid rendering content momentarily.
  // This also catches the case where a redirect might be delayed or fail.
  if (status === "unauthenticated") {
    return null
  }

  // If authenticated, render the layout
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <main className="bg-[var(--back)] flex-1 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}