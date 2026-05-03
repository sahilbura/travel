import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai"
import { format } from "date-fns"
import { Activity } from "@/app/generated/prisma" // Assuming this path is correct for your Prisma generated types

import { getServerSession } from "next-auth" // Import getServerSession
import { authOptions } from "@/lib/auth" // Import your NextAuth configuration

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string)
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

// Helper function to validate and clean JSON response
function validateAndCleanJSON(jsonString: string) {
  try {
    // Remove any potential markdown formatting
    let cleaned = jsonString.trim()

    // Remove markdown code blocks if present
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "")
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "")
    }

    // Try to find JSON array in the response
    const jsonStart = cleaned.indexOf("[")
    const jsonEnd = cleaned.lastIndexOf("]")

    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1)
    }

    return JSON.parse(cleaned)
  } catch (error) {
    console.error("JSON parsing error:", error)
    console.error("Raw string:", jsonString)
    throw new Error("Failed to parse AI response as JSON")
  }
}

// Helper function to validate activity data (matching your Prisma schema)
function validateActivity(activity: Activity) {
  return {
    name: activity.name || "Untitled Activity",
    type: activity.type || "General",
    time: activity.time || null,
    description: activity.description || null,
    address: activity.address || null,
    notes: activity.notes || null,
    budget:
      activity.budget !== undefined && activity.budget !== null ? Number(activity.budget) : null, // Keep budget numeric
  }
}

type Params =  Promise<{ tripId: string }> 

export async function POST(req: NextRequest, { params }: {params: Params}) {
  const { tripId } = await params // Destructure params directly

  if (!tripId) {
    return NextResponse.json({ message: "Trip ID is required" }, { status: 400 })
  }

  try {
    // --- NextAuth Authentication and Authorization ---
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }
    // --- End Authentication ---

    // Find the trip to ensure it exists and belongs to the authenticated user
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        days: {
          orderBy: { dayIndex: "asc" },
          include: { activities: true },
        },
      },
    })

    if (!trip) {
      return NextResponse.json({ message: "Trip not found" }, { status: 404 })
    }

    // --- Authorization: Check if the trip belongs to the authenticated user ---
    if (trip.userId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden: You do not own this trip" }, { status: 403 })
    }
    // --- End Authorization ---

    // First, delete any existing days for this trip
    await prisma.day.deleteMany({
      where: { tripId },
    })

    const durationDays =
      Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1

    // ** Prompt with emphasis on searching for realistic budgets for each activity **
    const prompt = `You are an expert AI travel planner with access to realistic cost data from multiple sources across the web.
Generate a detailed ${durationDays}-day itinerary for ${trip.destination}, ensuring each day's activities include a relevant numeric budget in USD.
Utilize typical travel costs, local average prices, and standard fees to provide realistic activity costs without exceeding the trip's total budget if specified.

Trip Details:
- Destination: ${trip.destination}
- Duration: ${durationDays} days (${format(new Date(trip.startDate), "PPP")} to ${format(new Date(trip.endDate), "PPP")})
- Interests: ${
      trip.interests && Array.isArray(trip.interests) && trip.interests.length > 0
        ? trip.interests.join(", ")
        : "General sightseeing"
    }
- Total Budget: ${
      trip.budget ? `$${trip.budget.toLocaleString()} USD (approximate cap)` : "Not specified; use typical travel costs"
    }

Return ONLY a valid JSON array with this exact structure:

[
  {
    "dayIndex": 0,
    "date": "2024-06-15",
    "summary": "Brief day summary",
    "activities": [
      {
        "name": "Activity name",
        "type": "Attraction",
        "time": "9:00 AM",
        "description": "Activity description (under 250 chars)",
        "address": "Address if known",
        "notes": "Helpful tips, under 200 chars",
        "budget": 25
      }
    ]
  }
]

Requirements:
- Include 3-5 activities per day
- Provide realistic time slots, addresses (if known), and budget estimates (USD)
- Keep 'description' and 'notes' concise (strictly under 250 and 200 characters, respectively)
- Focus on must-see destinations and keep total spending in line with the user's budget (if provided)
- Return ONLY the JSON array, no additional text.`

    console.log("Sending prompt to Gemini...")

    // Call Gemini API with retry logic
    let result
    let attempts = 0
    const maxAttempts = 3

    while (attempts < maxAttempts) {
      try {
        result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7,
            maxOutputTokens: 8192,
          },
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
          ],
        })
        break // Success, exit retry loop
      } catch (error) {
        attempts++
        console.error(`Attempt ${attempts} failed:`, error)
        if (attempts >= maxAttempts) {
          throw error
        }
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempts))
      }
    }

    if (!result) {
      throw new Error("Failed to get response from Gemini after multiple attempts")
    }

    // Extract and validate the response
    const rawItinerary = result.response.text()
    if (!rawItinerary) {
      throw new Error("Gemini did not return an itinerary.")
    }

    console.log("Raw Itinerary from Gemini:", rawItinerary.substring(0, 500) + "...")

    // Validate and parse JSON
    const itineraryData = validateAndCleanJSON(rawItinerary)

    if (!Array.isArray(itineraryData)) {
      throw new Error("Gemini response was not a JSON array of days.")
    }

    if (itineraryData.length === 0) {
      throw new Error("Gemini returned an empty itinerary.")
    }

    // Save itinerary to database with proper error handling
    const newDays = []

    for (let i = 0; i < itineraryData.length; i++) {
      const dayPlan = itineraryData[i]

      // Calculate the actual date for this day
      const dayDate = new Date(trip.startDate)
      dayDate.setDate(dayDate.getDate() + i)

      // Validate and clean activities
      const validActivities = (dayPlan.activities || []).map(validateActivity)

      if (validActivities.length === 0) {
        console.warn(`Day ${i} has no valid activities, skipping...`)
        continue
      }

      try {
        const newDay = await prisma.day.create({
          data: {
            tripId: trip.id,
            date: dayDate,
            dayIndex: i,
            summary: dayPlan.summary || `Day ${i + 1} in ${trip.destination}`,
            activities: {
              create: validActivities,
            },
          },
          include: {
            activities: true,
          },
        })
        newDays.push(newDay)
      } catch (dbError) {
        console.error(`Error creating day ${i}:`, dbError)
        // Continue with other days even if one fails
      }
    }

    if (newDays.length === 0) {
      throw new Error("No valid days could be created from the itinerary.")
    }

    console.log(`Successfully created ${newDays.length} days with itinerary`)

    return NextResponse.json(
      {
        message: "Itinerary generated successfully",
        days: newDays,
        totalDays: newDays.length,
      },
      { status: 200 },
    )
  } catch (error: unknown) {
    console.error("API Error generating itinerary:", error)

    // Provide specific error messages based on error type
    let errorMessage = "Failed to generate itinerary. Please try again."
    let statusCode = 500

    if (error instanceof Error) {
      if (error.message?.includes("Authentication required")) {
        errorMessage = "Authentication is required to perform this action."
        statusCode = 401
      } else if (error.message?.includes("Forbidden")) {
        errorMessage = "You are not authorized to access this resource."
        statusCode = 403
      } else if (error.message?.includes("API key")) {
        errorMessage = "AI service configuration error. Please contact support."
        statusCode = 503
      } else if (error.message?.includes("quota") || error.message?.includes("rate limit")) {
        errorMessage = "Service temporarily unavailable due to high demand. Please try again in a few minutes."
        statusCode = 429
      } else if (error.message?.includes("JSON")) {
        errorMessage = "Failed to parse AI response. The service may be experiencing issues. Please try again."
        statusCode = 502
      } else if (error.message?.includes("timeout")) {
        errorMessage = "Request timed out. Please try again."
        statusCode = 504
      }
    }

    return NextResponse.json(
      {
        message: errorMessage,
        error: process.env.NODE_ENV === "development" && error instanceof Error ? error.message : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode },
    )
  }
}