"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HelpCircle,
  Heart,
  LayoutDashboard,
  LogOut,
  Map,
  MapPin,
  Plane,
  Search,
  Settings,
  Sparkles,
  User,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "@/lib/auth-client";
import { useEffect, useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

function getStatusDotStyle(status: Status): string {
  switch (status) {
    case "active":    return "background: var(--success-icon)";
    case "completed": return "background: var(--text-subtle)";
    case "draft":
    default:          return "background: var(--warning-icon)";
  }
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

  const userName = session?.user?.name || "Traveler";
  const userEmail = session?.user?.email || "";

  useEffect(() => {
    fetch("/api/itinerary/user")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setRecentTrips(data.slice(0, 3));
        }
      })
      .catch(() => {});
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
      style={{ borderRight: "1px solid var(--border-light)", background: "var(--bg-base)" }}
    >
      {/* Header / Logo */}
      <SidebarHeader className="px-4 py-5">
        <Link href="/" className="flex items-center gap-2.5 px-1">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: "var(--accent-50)", color: "var(--accent-500)" }}
          >
            <Plane className="h-4 w-4" />
          </div>
          <span
            className="text-[22px] font-bold tracking-tight"
            style={{
              fontFamily: "var(--font-display), 'Playfair Display', serif",
              color: "var(--text-primary)",
            }}
          >
            TravelMind
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 pb-4">
        {/* Main menu */}
        <SidebarGroup>
          <SidebarGroupLabel
            className="px-3"
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-subtle)",
              padding: "16px 12px 6px",
            }}
          >
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {menuItems.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/" || pathname.startsWith(item.href)
                    : pathname.startsWith(item.href);
                const isHighlighted = "highlighted" in item && item.highlighted;
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn("h-10 rounded-xl px-3 text-[14px] font-medium transition-all duration-120 relative")}
                      style={
                        isActive
                          ? {
                              background: "var(--primary-50)",
                              color: "var(--primary-700)",
                              borderLeft: "3px solid var(--primary-500)",
                            }
                          : isHighlighted && !isActive
                          ? {
                              color: "var(--accent-700)",
                            }
                          : {
                              color: "var(--text-secondary)",
                            }
                      }
                    >
                      <Link href={item.href}>
                        <Icon
                          className="h-4 w-4 shrink-0"
                          style={{
                            color: isActive
                              ? "var(--primary-500)"
                              : isHighlighted && !isActive
                              ? "var(--accent-500)"
                              : "var(--text-muted)",
                          }}
                        />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Recent Trips */}
        <SidebarGroup>
          <SidebarGroupLabel
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-subtle)",
              padding: "16px 12px 6px",
            }}
          >
            Recent Trips
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {recentTrips.length === 0 ? (
                <SidebarMenuItem>
                  <div
                    className="px-3 py-2 text-xs italic"
                    style={{ color: "var(--text-subtle)" }}
                  >
                    No trips yet — plan your first!
                  </div>
                </SidebarMenuItem>
              ) : (
                recentTrips.map((trip) => (
                  <SidebarMenuItem key={trip.id}>
                    <SidebarMenuButton
                      asChild
                      className="h-auto rounded-xl px-3 py-2.5 text-xs transition-all"
                      style={{
                        border: "1px solid var(--border-default)",
                        background: "var(--bg-wash)",
                      }}
                    >
                      <Link href={`/itinerary/${trip.id}/view`}>
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ display: "inline-block", ...Object.fromEntries(
                            getStatusDotStyle(trip.status as Status).split(";").filter(Boolean).map(s => {
                              const [k, v] = s.split(":").map(x => x.trim());
                              return [k.replace(/-([a-z])/g, (_, l) => l.toUpperCase()), v];
                            })
                          ) }}
                        />
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span
                            className="max-w-[9rem] truncate text-[12px] font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {trip.title}
                          </span>
                          <span
                            className="truncate text-[11px] flex items-center gap-1"
                            style={{ color: "var(--text-muted)" }}
                          >
                            <MapPin className="h-3 w-3 shrink-0" />
                            {trip.destination}, {trip.country}
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


      </SidebarContent>

      {/* Footer: User card */}
      <SidebarFooter className="p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              className="space-y-3 rounded-xl p-3 cursor-pointer"
              style={{
                border: "1px solid var(--border-light)",
                background: "var(--bg-subtle)",
              }}
            >
              <div className="flex items-center gap-3">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={userName}
                    className="h-9 w-9 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white shrink-0"
                    style={{ background: "var(--accent-500)" }}
                  >
                    {getInitials(userName)}
                  </div>
                )}
                <div className="flex flex-1 flex-col min-w-0">
                  <span
                    className="text-[13px] font-semibold truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {userName}
                  </span>
                  <span
                    className="text-[11px] truncate"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {userEmail}
                  </span>
                </div>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="right"
            align="end"
            sideOffset={12}
            className="w-56 rounded-xl border-border-light shadow-lg"
            style={{ fontFamily: "var(--font-sans)", background: "var(--bg-base)" }}
          >
            {[
              { label: "Notifications", icon: Bell, href: "/notifications" },
              { label: "Profile", icon: User, href: "/profile" },
              { label: "Settings", icon: Settings, href: "#" },
              { label: "Help & Support", icon: HelpCircle, href: "#" },
            ].map((acct) => (
              <DropdownMenuItem key={acct.label} asChild className="cursor-pointer gap-2 px-3 py-2.5 text-[14px]">
                <Link href={acct.href} className="flex items-center w-full">
                  <acct.icon className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                  <span style={{ color: "var(--text-secondary)" }}>{acct.label}</span>
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator style={{ background: "var(--border-light)" }} />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer gap-2 px-3 py-2.5 text-[14px]"
            >
              <LogOut className="h-4 w-4" style={{ color: "var(--danger-text)" }} />
              <span style={{ color: "var(--danger-text)" }}>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
