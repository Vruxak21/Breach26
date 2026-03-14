"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HelpCircle,
  Heart,
  LayoutDashboard,
  LogOut,
  Map,
  Plane,
  Search,
  Settings,
  Sparkles,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Plan a Trip", icon: Sparkles, href: "/planner", highlighted: true },
  { label: "Explore", icon: Search, href: "/search" },
  { label: "Wishlist", icon: Heart, href: "/wishlist" },
  { label: "My Trips", icon: Map, href: "/profile" },
] as const;

type Status = "draft" | "active" | "completed";

interface SidebarTrip {
  id: string;
  title: string;
  destination: string;
  country: string;
  status: string;
}

function getStatusDotColor(status: Status): string {
  switch (status) {
    case "active":
      return "bg-emerald-500";
    case "completed":
      return "bg-slate-400";
    case "draft":
    default:
      return "bg-amber-400";
  }
}

function getFlagEmoji(country: string): string {
  if (country === "India") return "🇮🇳";
  if (country === "Indonesia") return "🇮🇩";
  if (country === "France") return "🇫🇷";
  if (country === "Japan") return "🇯🇵";
  if (country === "Thailand") return "🇹🇭";
  return "🌍";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [recentTrips, setRecentTrips] = useState<SidebarTrip[]>([]);
  const { newCount, fetchItems, isLoaded } = useWishlistStore();

  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";

  useEffect(() => {
    if (!isLoaded) fetchItems();
  }, [isLoaded, fetchItems]);

  useEffect(() => {
    // Fetch user's recent trips
    fetch("/api/itinerary/user")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setRecentTrips(data.slice(0, 3));
        }
      })
      .catch(() => {
        // Silently fail — sidebar still renders
      });
  }, []);

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/signin";
        },
      },
    });
  };

  return (
    <ShadcnSidebar
      variant="sidebar"
      side="left"
      className="border-r border-[#E8E8E2] bg-white/95"
    >
      <SidebarHeader className="px-4 py-4">
        <div className="flex items-center gap-2 px-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#4F46E5] shadow-sm">
            <Plane className="h-4 w-4" />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight text-[#111111]">
            TravelMind
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 pb-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-semibold tracking-[0.16em] text-[#9CA3AF]">
            MENU
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {menuItems.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/" || pathname.startsWith(item.href)
                    : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        "h-10 rounded-xl px-3 text-sm font-medium text-[#6B7280] hover:bg-[#F7F7F4] hover:text-[#111111]",
                        isActive && "bg-[#EEF2FF] text-[#4338CA]",
                        "highlighted" in item && item.highlighted && !isActive && "bg-[#FFF7ED] text-[#C2410C] hover:bg-orange-100",
                      )}
                    >
                      <Link href={item.href} className="relative">
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                        {item.label === "Wishlist" && newCount > 0 && (
                          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm">
                            {newCount > 9 ? "9+" : newCount}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-semibold tracking-[0.16em] text-[#9CA3AF]">
            TRIPS
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {recentTrips.length === 0 ? (
                <SidebarMenuItem>
                  <div className="px-3 py-2 text-xs text-slate-400 italic">
                    No trips yet — plan your first!
                  </div>
                </SidebarMenuItem>
              ) : (
                recentTrips.map((trip) => (
                  <SidebarMenuItem key={trip.id}>
                    <SidebarMenuButton
                      asChild
                      className="h-auto rounded-xl border border-[#E8E8E2] bg-[#F7F7F4] px-3 py-2 text-xs shadow-sm hover:border-[#D4D4CC] hover:bg-white"
                    >
                      <Link href={`/itinerary/${trip.id}/view`}>
                        <span
                          className={cn(
                            "h-2.5 w-2.5 rounded-full",
                            getStatusDotColor(trip.status as Status),
                          )}
                        />
                        <span className="flex min-w-0 flex-col">
                          <span className="max-w-[9rem] truncate text-[11px] font-medium text-slate-800">
                            {trip.title}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {trip.destination} {getFlagEmoji(trip.country)}
                          </span>
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-semibold tracking-[0.16em] text-[#9CA3AF]">
            ACCOUNT
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="h-10 rounded-xl px-3 text-sm font-medium text-[#6B7280] hover:bg-[#F7F7F4] hover:text-[#111111]"
                >
                  <Link href="/profile">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="h-10 rounded-xl px-3 text-sm font-medium text-[#6B7280] hover:bg-[#F7F7F4] hover:text-[#111111]">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="h-10 rounded-xl px-3 text-sm font-medium text-[#6B7280] hover:bg-[#F7F7F4] hover:text-[#111111]">
                  <HelpCircle className="h-4 w-4" />
                  <span>Help</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleSignOut}
                  className="h-10 rounded-xl px-3 text-sm font-medium text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 pb-4 pt-2">
        <div className="space-y-3 rounded-2xl border border-[#E8E8E2] bg-[#F7F7F4] p-3 shadow-inner">
          <div className="flex items-center gap-3">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={userName}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4F46E5] text-xs font-semibold text-white">
                {getInitials(userName)}
              </div>
            )}
            <div className="flex flex-1 flex-col">
              <span className="text-sm font-medium text-slate-900">{userName}</span>
              <span className="text-xs text-slate-500">{userEmail}</span>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
