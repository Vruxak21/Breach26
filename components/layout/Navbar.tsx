"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plane, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { label: "Destinations", href: "/search" },
  { label: "Itineraries", href: "/dashboard" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Planner", href: "/planner" },
] as const;

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[#E8E8E2] bg-white/95 backdrop-blur-md">
      <div className="tm-container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#4F46E5]">
            <Plane className="h-4 w-4" />
          </span>
          <span className="font-display text-2xl font-bold tracking-tight text-[#111111]">
            TravelMind
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative pb-1 text-sm text-[#6B7280] transition-colors hover:text-[#111111]",
                  isActive && "font-medium text-[#111111]",
                )}
              >
                {item.label}
                {isActive && (
                  <span className="absolute -bottom-0.5 left-0 h-0.5 w-full rounded-full bg-[#4F46E5]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            aria-label="Search"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E8E8E2] bg-white text-[#6B7280] transition-colors hover:bg-[#F7F7F4] hover:text-[#111111]"
          >
            <Search className="h-4 w-4" />
          </button>
          <Link href="/signup" className="tm-btn-primary py-2.5">
            Sign Up
          </Link>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E8E8E2] bg-white text-[#374151] md:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl border-[#E8E8E2] bg-white p-0" showCloseButton={false}>
            <SheetHeader className="px-6 pt-6 pb-2 text-left">
              <SheetTitle className="font-display text-2xl">TravelMind</SheetTitle>
              <SheetDescription>Plan your next trip with confidence.</SheetDescription>
            </SheetHeader>
            <nav className="space-y-1 px-4 pb-6">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "block rounded-xl px-4 py-3 text-sm text-[#374151] transition-colors hover:bg-[#F7F7F4]",
                      isActive && "bg-[#EEF2FF] font-medium text-[#4338CA]",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link href="/signup" className="tm-btn-primary mt-3 w-full">
                Sign Up
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

