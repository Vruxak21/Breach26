"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Home,
  Search,
  Sparkles,
  Heart,
  User as UserIcon,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

const bottomNavItems = [
  { label: "Home", icon: Home, href: "/dashboard" },
  { label: "Explore", icon: Search, href: "/search" },
  { label: "Plan", icon: Sparkles, href: "/planner" },
  { label: "Wishlist", icon: Heart, href: "/wishlist" },
  { label: "Profile", icon: UserIcon, href: "/profile" },
] as const;

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // Placeholder auth gate; to be wired with Better Auth
  const isAuthenticated = true;
  const pathname = usePathname();

  if (!isAuthenticated) {
    // In a later phase, redirect to /signin when unauthenticated
    return null;
  }

  return (
    <SidebarProvider defaultOpen>
      <Sidebar />

      <SidebarInset className="min-h-screen bg-slate-50">
        <Navbar />

        <main className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 pb-20 pt-4 lg:px-12 md:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="flex-1"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </SidebarInset>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-2.5">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/" || pathname.startsWith(item.href)
                : pathname.startsWith(item.href);

            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 text-xs font-medium",
                  isActive ? "text-indigo-600" : "text-slate-400",
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full",
                    isActive ? "bg-indigo-50" : "bg-transparent",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className={cn(isActive ? "opacity-100" : "opacity-80")}>
                  {item.label}
                </span>
              </a>
            );
          })}
        </div>
      </nav>
    </SidebarProvider>
  );
}

