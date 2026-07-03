import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/lib/types";

type FlyEvent = {
  fromX: number;
  fromY: number;
  image?: string;
};

type CartStore = {
  items: CartItem[];
  isOpen: boolean;
  flyQueue: FlyEvent[];
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQty: (variantId: string, qty: number) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
  triggerFly: (event: FlyEvent) => void;
  consumeFly: () => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      flyQueue: [],

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      triggerFly: (event) =>
        set({ flyQueue: [...get().flyQueue, event] }),

      consumeFly: () =>
        set({ flyQueue: get().flyQueue.slice(1) }),

      addItem: (item) => {
        const existing = get().items.find((i) => i.variantId === item.variantId);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.variantId === item.variantId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...get().items, item] });
        }
      },

      removeItem: (variantId) => {
        set({ items: get().items.filter((i) => i.variantId !== variantId) });
      },

      updateQty: (variantId, qty) => {
        if (qty <= 0) {
          get().removeItem(variantId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.variantId === variantId ? { ...i, quantity: qty } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      total: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      itemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "ethereal-dayo-cart",
      // Don't persist flyQueue across sessions
      partialize: (state) => ({
        items: state.items,
        isOpen: state.isOpen,
      }),
    }
  )
);

type SearchStore = {
  isOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
};

export const useSearchStore = create<SearchStore>()((set) => ({
  isOpen: false,
  openSearch: () => set({ isOpen: true }),
  closeSearch: () => set({ isOpen: false }),
}));
