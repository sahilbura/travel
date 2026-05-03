"use client"

import { useState } from "react"
import {usePathname } from "next/navigation"
import { Home, MapPin, Plus, User, LogOut, Plane, HelpCircle, LayoutDashboard } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/app/components/ui/sidebar"
import { Button } from "@/app/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { useSession, signOut } from "next-auth/react" // ✅ Replace useAuth

const navigationItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Trips", url: "/dashboard/trips", icon: MapPin },
  { title: "Create Trip", url: "/dashboard/create-trip", icon: Plus },
]

const accountItems = [
  { title: "Profile", url: "/dashboard/profile", icon: User },
  { title: "Help & Support", url: "/dashboard/help", icon: HelpCircle },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession() // ✅
  const user = session?.user
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(); // No need for { redirect: false } or router.push("/") here
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getInitials = (name: string | null | undefined, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return email?.slice(0, 2).toUpperCase()
  }

  return (
    <Sidebar className="border-r border-primary/10 bg-bg">
      <SidebarHeader className="border-b border-primary/10 p-6 bg-bg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-accent1 to-accent2 rounded-xl flex items-center justify-center">
            <Plane className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-primary">TripNext</h2>
            <p className="text-sm text-primary/70">Dashboard</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6 bg-bg">
        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-primary/60 uppercase tracking-wider mb-3">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="w-full justify-start gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                                 text-primary hover:bg-btn/30 hover:text-primary
                                 data-[active=true]:bg-btn data-[active=true]:text-primary"
                  >
                    <a href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span className="font-medium">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Account */}
        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-xs font-medium text-primary/60 uppercase tracking-wider mb-3">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="w-full justify-start gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                                 text-primary hover:bg-btn/30 hover:text-primary
                                 data-[active=true]:bg-btn data-[active=true]:text-primary"
                  >
                    <a href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span className="font-medium">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-primary/10 p-4 bg-bg">
        {/* User Profile */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-bg mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder.svg" alt={user?.name || user?.email || ""} />
            <AvatarFallback className="bg-gradient-to-r from-accent1 to-accent2 text-primary font-medium">
              {user && getInitials(user.name, user.email)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary truncate">{user?.name || "User"}</p>
            <p className="text-xs text-primary/70 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          disabled={isLoggingOut}
          variant="ghost"
          className="w-full justify-start gap-3 px-3 py-2.5
                     text-accent2 hover:text-accent2/80 hover:bg-accent2/10"
        >
          {isLoggingOut ? (
            <div className="w-4 h-4 border-2 border-accent2/30 border-t-accent2 rounded-full animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          <span className="font-medium">{isLoggingOut ? "Signing out..." : "Sign out"}</span>
        </Button>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
