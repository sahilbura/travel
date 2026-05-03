"use client";

import {
  Navbar,
  NavBody,
  NavbarLogo,
  NavItems,
  NavbarButton,
  MobileNav,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "./ui/resizable-navbar";
import { motion } from "framer-motion";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface NavItem {
  name: string;
  link: string;
}

interface NavBProps {
  navItems: NavItem[];
}

export const NavB = ({ navItems }: NavBProps) => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  const user = session?.user;
  const isLoggedIn = !!user;

  const handleDashboardClick = () => {
    router.push("/dashboard");
  };

  return (
    <Navbar>
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo />
        <NavItems items={navItems} />
        <div className="hidden md:flex items-center gap-4 ml-auto">
          {isLoggedIn ? (
            <>
              {user?.name && (
                <motion.span 
                  className="text-[var(--color-primary)] text-sm font-semibold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Welcome, {user.name}
                </motion.span>
              )}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <NavbarButton 
                  variant="primary" 
                  onClick={handleDashboardClick}
                  className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-semibold shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Dashboard
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </NavbarButton>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <NavbarButton 
                  variant="secondary" 
                  onClick={() => router.push("/auth/login")}
                  className="px-6 py-2.5 rounded-full border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-semibold hover:bg-[var(--color-primary)]/10 transition-all duration-300 hover:border-[var(--color-accent1)]"
                >
                  Login
                </NavbarButton>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <NavbarButton 
                  variant="primary" 
                  onClick={() => router.push("/auth/signup")}
                  className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-semibold px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Sign Up
                </NavbarButton>
              </motion.div>
            </>
          )}
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          {navItems.map((item, idx) => (
            <Link
              key={`mobile-link-${idx}`}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className="relative text-[var(--color-primary)]"
            >
              <span className="block">{item.name}</span>
            </Link>
          ))}

          <div className="flex w-full flex-col gap-4 mt-4">
            {isLoggedIn ? (
              <>
                {user?.name && (
                  <span className="text-[var(--color-primary)] text-sm font-medium px-4 py-2 mr-4">
                    Welcome, {user.name}
                  </span>
                )}
                <NavbarButton
                  onClick={handleDashboardClick}
                  variant="primary"
                  className="w-full"
                >
                  Dashboard
                </NavbarButton>
              </>
            ) : (
              <>
                <NavbarButton
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    router.push("/auth/login");
                  }}
                  variant="secondary"
                  className="w-full"
                >
                  Login
                </NavbarButton>
                <NavbarButton
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    router.push("/auth/signup");
                  }}
                  variant="primary"
                  className="w-full"
                >
                  Sign Up
                </NavbarButton>
              </>
            )}
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
};
