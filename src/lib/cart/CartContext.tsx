"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type CartItem = {
  slug: string;
  name: string;
  brand: string;
  /** Display-only leftover. Real prices always come from the server. */
  price: number;
  image: string;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  totalQty: number;
  /** False until the saved cart has been read from the browser. */
  ready: boolean;
  getQty: (slug: string) => number;
  updateQty: (item: Omit<CartItem, "qty">, qty: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "vairutya-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage write failures (e.g. private browsing)
    }
  }, [items, hydrated]);

  function updateQty(item: Omit<CartItem, "qty">, qty: number) {
    setItems((prev) => {
      const existing = prev.find((i) => i.slug === item.slug);
      if (qty <= 0) return prev.filter((i) => i.slug !== item.slug);
      if (existing) return prev.map((i) => (i.slug === item.slug ? { ...i, qty } : i));
      return [...prev, { ...item, qty }];
    });
  }

  function getQty(slug: string) {
    return items.find((i) => i.slug === slug)?.qty ?? 0;
  }

  function clearCart() {
    setItems([]);
  }

  const totalQty = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider
      value={{ items, totalQty, ready: hydrated, getQty, updateQty, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
