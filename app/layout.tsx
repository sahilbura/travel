import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";

import "./globals.css";
// import { AuthProvider } from "@/contexts/auth-context";
import NextAuthSessionProvider from "./components/Providers";
import MUIProvider from "./components/MUIProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const myFont = localFont({
  src: [
    {
      path: "./fonts/NeutralFace.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/NeutralFace-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
});


export const metadata: Metadata = {
  title: "TripNext — Plan. Explore. Remember.",
  description: "TripNext helps you plan unforgettable trips, discover destinations, and craft personalized itineraries.",
  generator: "Next.js",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${myFont.className} antialiased`}
        >
          <MUIProvider>
            <NextAuthSessionProvider>
              {children}
            </NextAuthSessionProvider>
          </MUIProvider>
      </body>
    </html>
  );
}
