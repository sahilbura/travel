// Pexels API service
export interface PexelsPhoto {
  id: number
  width: number
  height: number
  url: string
  photographer: string
  photographer_url: string
  photographer_id: number
  avg_color: string
  src: {
    original: string
    large2x: string
    large: string
    medium: string
    small: string
    portrait: string
    landscape: string
    tiny: string
  }
  liked: boolean
  alt: string
}

export interface PexelsResponse {
  total_results: number
  page: number
  per_page: number
  photos: PexelsPhoto[]
  next_page?: string
}

export interface Destination {
  id: string
  name: string
  country: string
  description: string
  category: "popular"  | "foreign" | "adventure" | "cultural"
  photos: PexelsPhoto[]
  attractions: string[]
  bestTime: string
  budget: string
}

class DestinationsService {
  private pexelsApiKey = process.env.PEXELS_API_KEY
  private pexelsBaseUrl = "https://api.pexels.com/v1"

  async searchPhotos(query: string, count = 6): Promise<PexelsPhoto[]> {
    if (!this.pexelsApiKey) {
      console.warn("Pexels API key not found")
      return []
    }

    try {
      const response = await fetch(
        `${this.pexelsBaseUrl}/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
        {
          headers: {
            Authorization: this.pexelsApiKey,
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.statusText}`)
      }

      const data: PexelsResponse = await response.json()
      return data.photos || []
    } catch (error) {
      console.error("Error fetching photos from Pexels:", error)
      return []
    }
  }

  // Predefined popular destinations with curated data
  getPopularDestinations(): Destination[] {
  return [
    {
      id: "tokyo",
      name: "Tokyo",
      country: "Japan",
      description: "A bustling metropolis blending traditional culture with cutting-edge technology.",
      category: "popular",
      photos: [],
      attractions: ["Senso-ji Temple", "Tokyo Skytree", "Shibuya Crossing", "Imperial Palace"],
      bestTime: "March to May, September to November",
      budget: "$100-250/day",
    },
    {
      id: "dubai",
      name: "Dubai",
      country: "UAE",
      description: "Futuristic city with luxury shopping, modern architecture, and desert adventures.",
      category: "foreign",
      photos: [],
      attractions: ["Burj Khalifa", "Dubai Mall", "Palm Jumeirah", "Desert Safari"],
      bestTime: "November to March",
      budget: "$200-500/day",
    },
    {
      id: "patagonia",
      name: "Patagonia",
      country: "Chile/Argentina",
      description: "Remote wilderness with glaciers, hiking trails, and breathtaking mountains.",
      category: "adventure",
      photos: [],
      attractions: ["Torres del Paine", "Perito Moreno Glacier", "Fitz Roy", "Hiking Trails"],
      bestTime: "November to March",
      budget: "$100-250/day",
    },
    {
      id: "paris",
      name: "Paris",
      country: "France",
      description: "The City of Light, famous for its art, fashion, gastronomy, and culture.",
      category: "popular",
      photos: [],
      attractions: ["Eiffel Tower", "Louvre Museum", "Notre-Dame Cathedral", "Champs-Élysées"],
      bestTime: "April to June, September to October",
      budget: "$150-300/day",
    },
    {
      id: "thailand",
      name: "Bangkok",
      country: "Thailand",
      description: "Vibrant capital with temples, street food, and bustling markets.",
      category: "foreign",
      photos: [],
      attractions: ["Grand Palace", "Wat Pho Temple", "Floating Markets", "Khao San Road"],
      bestTime: "November to February",
      budget: "$50-150/day",
    },
    {
      id: "queenstown",
      name: "Queenstown",
      country: "New Zealand",
      description: "Adventure capital of the world with bungee jumping, skiing, and stunning scenery.",
      category: "adventure",
      photos: [],
      attractions: ["Skydiving", "Bungee Jumping", "Lake Wakatipu", "Ski Resorts"],
      bestTime: "December to February",
      budget: "$150-300/day",
    },
    {
      id: "kyoto",
      name: "Kyoto",
      country: "Japan",
      description: "A cultural gem with temples, gardens, and traditional geisha districts.",
      category: "cultural",
      photos: [],
      attractions: ["Fushimi Inari", "Kinkaku-ji", "Gion", "Arashiyama Bamboo Grove"],
      bestTime: "March to May, October to November",
      budget: "$100-200/day",
    },
    {
      id: "new-york",
      name: "New York City",
      country: "USA",
      description: "The city that never sleeps, offering world-class attractions and experiences.",
      category: "popular",
      photos: [],
      attractions: ["Statue of Liberty", "Central Park", "Times Square", "Brooklyn Bridge"],
      bestTime: "April to June, September to November",
      budget: "$200-400/day",
    },
    {
      id: "dubrovnik",
      name: "Dubrovnik",
      country: "Croatia",
      description: "A stunning coastal city with medieval walls and historical charm.",
      category: "cultural",
      photos: [],
      attractions: ["Old Town Walls", "Lokrum Island", "Stradun", "Fort Lovrijenac"],
      bestTime: "May to September",
      budget: "$80-180/day",
    },
    {
      id: "barcelona",
      name: "Barcelona",
      country: "Spain",
      description: "Vibrant city known for its art, architecture, and Mediterranean beaches.",
      category: "popular",
      photos: [],
      attractions: ["Sagrada Familia", "Park Güell", "Las Ramblas", "Gothic Quarter"],
      bestTime: "May to June, September to October",
      budget: "$100-220/day",
    },
    {
      id: "vietnam",
      name: "Ho Chi Minh City",
      country: "Vietnam",
      description: "Dynamic city with rich history, delicious street food, and cultural sites.",
      category: "foreign",
      photos: [],
      attractions: ["War Remnants Museum", "Cu Chi Tunnels", "Ben Thanh Market", "Mekong Delta"],
      bestTime: "December to April",
      budget: "$40-120/day",
    },
    {
      id: "machu-picchu",
      name: "Machu Picchu",
      country: "Peru",
      description: "Ancient Incan citadel perched high in the Andes mountains.",
      category: "adventure",
      photos: [],
      attractions: ["Sun Gate", "Inca Trail", "Temple of the Sun", "Sacred Valley"],
      bestTime: "April to October",
      budget: "$80-200/day",
    },
    {
      id: "agra",
      name: "Agra",
      country: "India",
      description: "Home of the majestic Taj Mahal and Mughal-era architecture.",
      category: "cultural",
      photos: [],
      attractions: ["Taj Mahal", "Agra Fort", "Mehtab Bagh", "Fatehpur Sikri"],
      bestTime: "November to March",
      budget: "$30-100/day",
    },
    {
      id: "rome",
      name: "Rome",
      country: "Italy",
      description: "The Eternal City with ancient history, stunning architecture, and incredible cuisine.",
      category: "popular",
      photos: [],
      attractions: ["Colosseum", "Vatican City", "Trevi Fountain", "Roman Forum"],
      bestTime: "April to June, September to October",
      budget: "$120-280/day",
    },
    {
      id: "cappadocia",
      name: "Cappadocia",
      country: "Turkey",
      description: "Famous for its fairy chimneys, cave dwellings, and hot air balloons.",
      category: "adventure",
      photos: [],
      attractions: ["Hot Air Balloons", "Göreme", "Underground Cities", "Love Valley"],
      bestTime: "April to June, September to October",
      budget: "$70-150/day",
    },
    {
      id: "jerusalem",
      name: "Jerusalem",
      country: "Israel",
      description: "Sacred city with historical, religious, and cultural significance.",
      category: "cultural",
      photos: [],
      attractions: ["Western Wall", "Church of the Holy Sepulchre", "Old City", "Mount of Olives"],
      bestTime: "April to June, September to November",
      budget: "$100-250/day",
    }
  ];
}



  async getDestinationWithPhotos(destination: Destination): Promise<Destination> {
    // Create more specific search queries for better results
    const searchQueries = [
      `${destination.name} ${destination.country} landmarks`,
      `${destination.name} travel photography`,
      `${destination.name} tourist attractions`,
    ]

    // Try different search queries to get diverse photos
    let allPhotos: PexelsPhoto[] = []

    for (const query of searchQueries) {
      const photos = await this.searchPhotos(query, 1)
      allPhotos = [...allPhotos, ...photos]
      if (allPhotos.length >= 6) break
    }

    // Remove duplicates and limit to 6 photos
    const uniquePhotos = allPhotos
      .filter((photo, index, self) => index === self.findIndex((p) => p.id === photo.id))
      .slice(0, 6)

    return {
      ...destination,
      photos: uniquePhotos,
    }
  }

  async getAllDestinationsWithPhotos(): Promise<{
    popular: Destination[]
  }> {
    const popular = this.getPopularDestinations()

    // Fetch photos for all destinations with some delay to avoid rate limiting
    const fetchWithDelay = async (destinations: Destination[], delay: number) => {
      const results: Destination[] = []
      for (let i = 0; i < destinations.length; i++) {
        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
        const destWithPhotos = await this.getDestinationWithPhotos(destinations[i])
        results.push(destWithPhotos)
      }
      return results
    }

    const [popularWithPhotos] = await Promise.all([
      fetchWithDelay(popular, 100), // 100ms delay between requests
    ])

    return {
      popular: popularWithPhotos,
    }
  }
}

export const destinationsService = new DestinationsService()