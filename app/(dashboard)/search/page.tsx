"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, LayoutGrid, List, ChevronDown } from "lucide-react";
import { ActivityCard } from "@/components/cards/ActivityCard";
import { goaActivities } from "@/lib/placeholder-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const CATEGORIES = [
  "All", "Beaches", "Restaurants", "Adventure", 
  "Culture", "Nightlife", "Shopping", "Nature", "Wellness"
];

export default function SearchPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const handleWishlistToggle = (activityId: string, isWishlisted: boolean) => {
    if (isWishlisted) {
      toast.success("Added to wishlist", {
        description: "Item saved to your trip wishlist."
      });
      return;
    }

    toast.info("Removed from wishlist");
  };

  const handleAddToTrip = () => {
    toast.success("Added to trip successfully");
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-12">
      {/* PAGE HEADER */}
      <div className="px-6 pt-8 lg:px-12">
        <h1 className="font-display text-5xl font-bold text-[#111111]">Explore Activities</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Discover verified hotels, experiences and events
        </p>
      </div>

      {/* SEARCH BAR */}
      <div className="relative mt-6 max-w-3xl px-6 lg:px-12">
        <div className="tm-search-shell relative flex items-center p-2">
          <Search className="absolute left-10 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search destinations, hotels, activities..."
            className="w-full rounded-xl border-0 bg-transparent py-3.5 pl-12 pr-28 text-sm text-[#111111] shadow-none placeholder:text-[#9CA3AF] focus:outline-none"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-1.5 rounded-xl bg-[#F7F7F4] px-3 py-1.5 text-xs font-medium text-[#374151] transition-colors hover:bg-[#EEF2FF] hover:text-[#4338CA]"
          >
            <SlidersHorizontal className="size-3.5" />
            <span>Filters</span>
            {showFilters && (
              <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-indigo-600" />
            )}
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="mt-4 px-6 lg:px-12">
        <div className="flex items-center gap-4 overflow-x-auto pb-2 pt-1 scrollbar-hide">
          <div className="flex shrink-0 gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                data-active={activeCategory === category}
                className={cn(
                  "tm-tab whitespace-nowrap rounded-none border-x-0 border-t-0 px-2 py-2",
                  activeCategory === category
                    ? "border-b-[#4F46E5] text-[#111111]"
                    : "text-[#6B7280]"
                )}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="h-6 w-px shrink-0 bg-slate-200" />

          <div className="flex shrink-0 gap-3">
            <Select defaultValue="any-price">
              <SelectTrigger className="h-9 w-35 rounded-xl border-[#E8E8E2] bg-white text-sm">
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any-price">Any Price</SelectItem>
                <SelectItem value="under-500">Under ₹500</SelectItem>
                <SelectItem value="500-2000">₹500–₹2,000</SelectItem>
                <SelectItem value="above-2000">Above ₹2,000</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="any-rating">
              <SelectTrigger className="h-9 w-[130px] rounded-xl border-[#E8E8E2] bg-white text-sm">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any-rating">Any Rating</SelectItem>
                <SelectItem value="4-star">4+ Stars</SelectItem>
                <SelectItem value="4.5-star">4.5+ Stars</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="relevance">
              <SelectTrigger className="h-9 w-40 rounded-xl border-[#E8E8E2] bg-white text-sm">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="highest-rated">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* RESULTS HEADER */}
      <div className="mt-8 flex items-center justify-between px-6 lg:px-12">
        <p className="text-sm font-medium text-[#6B7280]">
          Showing 12 results for Goa
        </p>
        <div className="flex items-center gap-1 overflow-hidden rounded-lg border border-[#E8E8E2] bg-white p-1 shadow-sm">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "rounded-md p-1.5 transition-colors",
              viewMode === "grid" 
                ? "bg-slate-100 text-indigo-600" 
                : "text-slate-400 hover:text-slate-600"
            )}
            aria-label="Grid view"
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "rounded-md p-1.5 transition-colors",
              viewMode === "list" 
                ? "bg-slate-100 text-indigo-600" 
                : "text-slate-400 hover:text-slate-600"
            )}
            aria-label="List view"
          >
            <List className="size-4" />
          </button>
        </div>
      </div>

      {/* RESULTS GRID */}
      <div className={cn(
        "mt-4 px-6 lg:px-12",
        viewMode === "grid"
          ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "flex flex-col gap-4"
      )}>
        {goaActivities.slice(0, 12).map((activity) => (
          <div key={activity.id} className={viewMode === "grid" ? "flex justify-center" : ""}>
            <ActivityCard 
              activity={activity} 
              onWishlistToggle={(isWishlisted) => handleWishlistToggle(activity.id, isWishlisted)}
              onAddToTrip={() => handleAddToTrip()}
            />
          </div>
        ))}
      </div>

      {/* LOAD MORE BUTTON */}
      <button className="tm-btn-outline mx-auto mt-8 flex items-center gap-2 px-8 py-3">
        Load more results
        <ChevronDown className="size-4" />
      </button>
    </div>
  );
}
