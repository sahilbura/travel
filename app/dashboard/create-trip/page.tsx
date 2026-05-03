"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import CreateTripPage from "@/app/create-trip/page"

export default function DashboardCreateTripPage() {
  const router = useRouter()

  // Redirect to success page within dashboard context
  useEffect(() => {
    // Override the success redirect in the create trip component
    const originalPush = router.push
    router.push = (url: string) => {
      if (url.includes("/trips/")) {
        // Redirect to dashboard trip view instead
        return originalPush(url.replace("/trips/", "/trips/"))
      }
      return originalPush(url)
    }

    return () => {
      router.push = originalPush
    }
  }, [router])

  return <CreateTripPage />
}
