import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string // MongoDB ObjectId as string
      email: string
      name?: string | null
      image?: string | null
    }
    accessToken?: string
  }

  interface User {
    id: string
    email: string
    name?: string | null
    password?: string | null
    image?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    name?: string | null
    accessToken?: string
  }
}
