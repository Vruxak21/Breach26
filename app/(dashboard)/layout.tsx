"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
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
import { useSession } from "@/lib/auth-client";
import { useEffect } from "react";
import { useWishlistStore } from "@/lib/stores/wishlist-store";

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
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { newCount } = useWishlistStore();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/signin");
    }
  }, [isPending, session, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
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
                    "relative flex h-9 w-9 items-center justify-center rounded-full",
                    isActive ? "bg-indigo-50" : "bg-transparent",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label === "Wishlist" && newCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white shadow-sm ring-2 ring-white">
                      {newCount > 9 ? "9+" : newCount}
                    </span>
                  )}
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
