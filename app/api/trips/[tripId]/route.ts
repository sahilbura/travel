import {NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma'; // Ensure this path is correct

import { getServerSession } from "next-auth"; // Import getServerSession
import { authOptions } from "@/lib/auth"; // Import your NextAuth configuration

type Params = Promise<{ tripId: string }>;

export async function GET(
  req: NextRequest,
  { params }: { params: Params } // Corrected type for params to directly destructure
) {
  const { tripId } = await params; // Directly destructure params

  if (!tripId) {
    return NextResponse.json({ message: 'Trip ID is required' }, { status: 400 });
  }

  try {
    // --- NextAuth Authentication ---
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      // If no valid session or user ID in session, return 401 Unauthorized
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    // --- End Authentication ---

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        user: true, // You might still include user info for display purposes
        days: {
          orderBy: { dayIndex: 'asc' },
          include: { activities: true },
        },
      },
    });

    if (!trip) {
      return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
    }

    // --- Authorization: Check if the trip belongs to the authenticated user ---
    if (trip.userId !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden: You do not own this trip' }, { status: 403 });
    }
    // --- End Authorization ---

    // If authentication and authorization pass, return the trip
    return NextResponse.json({ trip }, { status: 200 });

  } catch (error: unknown) {
    console.error('API Error fetching trip:', error);
    // Generic error message for internal server errors
    return NextResponse.json(
      {
        message: 'Failed to fetch trip',
        error: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}