"use client";

import React from "react";
import { NavB } from "./components/NavB"; // adjust path accordingly
import { navLinks } from "@/constants";
import Hero from "./components/Hero";
import PopularDestinationsPage from "./components/Destinations";
import { ContactSection } from "./components/Contact";

export default function Home() {
  return (
    <main className="relative">
      <NavB navItems={navLinks.items} />
      <Hero />
      <PopularDestinationsPage />
      <ContactSection />
    </main>
  );
}

