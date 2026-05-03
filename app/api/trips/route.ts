import {  NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth" // Import getServerSession
import { authOptions } from "@/lib/auth" // Import your NextAuth configuration

export async function GET() {
  try {
    // Get the NextAuth session
    const session = await getServerSession(authOptions)

    // If no session or user in session, return 401 Unauthorized
    if (!session || !session.user || !session.user.id) {
      // Ensure session.user.id is available from your authOptions callbacks
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }

    // Get trips for the authenticated user only
    const trips = await prisma.trip.findMany({
      where: {
        userId: session.user.id, // Use the user ID from the NextAuth session
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(
      {
        message: trips.length > 0 ? "Trips fetched successfully" : "No trips found for this user",
        trips,
      },
      { status: 200 },
    )
  } catch (error: unknown) {
    console.error("Error fetching trips:", error)

    // For any other unexpected errors, return 500
    return NextResponse.json({ message: "Failed to fetch trips" }, { status: 500 })
  }
}