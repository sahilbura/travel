import { NextResponse } from "next/server";
import { destinationsService } from "@/lib/destinations-service";

export async function GET() {
  try {
    // Get all destinations
    const allDestinations = destinationsService.getPopularDestinations();

    // Get photos for all of them (no category filtering)
    const destinationsWithPhotos = await Promise.all(
      allDestinations.map(dest =>
        destinationsService.getDestinationWithPhotos(dest)
      )
    );

    return NextResponse.json({
      destinations: destinationsWithPhotos,
    });
  } catch (error) {
    console.error("Error fetching destinations:", error);
    return NextResponse.json(
      { error: "Failed to fetch destinations" },
      { status: 500 }
    );
  }
}
