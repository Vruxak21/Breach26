import { create } from "zustand";

interface WishlistItem {
  id: string;
  type: string;
  externalId?: string | null;
  data: any;
  addedAt: string;
  itineraryId?: string | null;
}

interface WishlistStore {
  items: WishlistItem[];
  newCount: number;
  isLoaded: boolean;

  fetchItems: () => Promise<void>;
  addItem: (
    type: string,
    data: any,
    externalId?: string,
    itineraryId?: string
  ) => Promise<WishlistItem | null>;
  removeItem: (id: string) => Promise<void>;
  resetNewCount: () => void;
  isInWishlist: (externalId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: [],
  newCount: 0,
  isLoaded: false,

  fetchItems: async () => {
    try {
      const res = await fetch("/api/wishlist");
      if (res.ok) {
        const data = await res.json();
        set({ items: Array.isArray(data) ? data : [], isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },

  addItem: async (type, data, externalId, itineraryId) => {
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data, externalId, itineraryId }),
      });

      if (res.ok) {
        const item = await res.json();
        set((state) => ({
          items: [item, ...state.items],
          newCount: state.newCount + 1,
        }));
        return item;
      }
      return null;
    } catch {
      return null;
    }
  },

  removeItem: async (id) => {
    try {
      const res = await fetch(`/api/wishlist?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      }
    } catch {}
  },

  resetNewCount: () => set({ newCount: 0 }),

  isInWishlist: (externalId) => {
    return get().items.some((item) => item.externalId === externalId);
  },
}));
