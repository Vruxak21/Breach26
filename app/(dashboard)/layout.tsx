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
import { Sidebar } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSession } from "@/lib/auth-client";
import { useEffect } from "react";

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

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/signin");
    }
  }, [isPending, session, router]);

  if (isPending) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: "var(--bg-subtle)" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="h-10 w-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "var(--accent-200)", borderTopColor: "var(--accent-500)" }}
          />
          <p
            className="text-[14px] font-medium"
            style={{ fontFamily: "var(--font-sans)", color: "var(--text-muted)" }}
          >
            Setting up your workspace...
          </p>
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

      <SidebarInset
        className="min-h-screen"
        style={{ background: "var(--bg-base)" }}
      >
        <main
          className={cn(
            "relative flex w-full flex-1 flex-col",
            pathname.startsWith("/search")
              ? "h-[100dvh] min-h-0 overflow-hidden pb-24 md:pb-10"
              : "mx-auto max-w-7xl px-6 pb-24 pt-6 lg:px-10 md:pb-10"
          )}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className={cn("flex-1", pathname.startsWith("/search") && "min-h-0")}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </SidebarInset>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 md:hidden"
        style={{
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid var(--border-light)",
          boxShadow: "0 -1px 12px rgba(17,17,16,0.06)",
        }}
      >
        <div className="mx-auto flex max-w-lg items-center justify-between px-2 py-2">
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
                className="flex flex-1 flex-col items-center gap-1"
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full transition-colors"
                  )}
                  style={{
                    background: isActive ? "var(--accent-50)" : "transparent",
                  }}
                >
                  <Icon
                    className="h-4.5 w-4.5"
                    style={{ color: isActive ? "var(--accent-500)" : "var(--text-muted)" }}
                  />
                </div>
                <span
                  className="text-[10px] font-medium"
                  style={{ color: isActive ? "var(--accent-600)" : "var(--text-muted)" }}
                >
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
