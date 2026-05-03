import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

import { getServerSession } from "next-auth" // Import getServerSession
import { authOptions } from "@/lib/auth" // Import your NextAuth configuration (ensure this path is correct)

export async function POST(request: NextRequest) {
  try {
    // --- NextAuth Authentication ---
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.id) {
      // If no valid session or user ID in session, return 401 Unauthorized
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }
    // --- End Authentication ---

    const body = await request.json()
    const { title, destination, destinationLat, destinationLng, startDate, endDate, interests, budget } = body

    // Validate required fields
    if (!title || !destination || !startDate || !endDate) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start >= end) {
      return NextResponse.json({ message: "End date must be after start date" }, { status: 400 })
    }

    // Create the trip with the authenticated user's ID from the session
    const trip = await prisma.trip.create({
      data: {
        title,
        destination,
        destinationLat: destinationLat || null,
        destinationLng: destinationLng || null,
        startDate: start,
        endDate: end,
        interests: interests || [],
        budget: budget || null,
        userId: session.user.id, // Use the authenticated user's ID from the NextAuth session
      },
    })

    return NextResponse.json(
      {
        message: "Trip created successfully",
        trip,
      },
      { status: 201 },
    )
  } catch (error: unknown) {
    console.error("Error creating trip:", error)

    // Handle authentication errors specifically, or a more general error
    let errorMessage = "Failed to create trip"
    let statusCode = 500

    if (error instanceof Error && error.message.includes("Authentication required")) {
      errorMessage = "Authentication is required to create a trip."
      statusCode = 401
    }

    return NextResponse.json(
      {
        message: errorMessage,
        error: process.env.NODE_ENV === "development" && error instanceof Error ? error.message : undefined,
      },
      { status: statusCode },
    )
  }
}