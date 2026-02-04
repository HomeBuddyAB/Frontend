"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { analytics } from "@/lib/analytics";

export interface CartItem {
  sku: string;
  name: string;
  color?: string;
  size?: string;
  price: number;
  quantity: number;
  image?: string;
  groupSlug: string;
  link?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;
  /** Replace cart with merged cart from login/register. Keeps existing item details where possible; adds placeholders for new SKUs. */
  replaceWithMergedCart: (mergedCartJson: string) => void;
  /** Build guest cart JSON for login/register: { items: [{ sku, quantity }] } */
  getGuestCartJson: () => string | null;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("homebuddy-cart");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load cart:", e);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("homebuddy-cart", JSON.stringify(items));
  }, [items]);

  const addItem = (newItem: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.sku === newItem.sku);
      if (existing) {
        return prev.map((item) =>
          item.sku === newItem.sku
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
    analytics.addToCart({
      sku: newItem.sku,
      name: newItem.name,
      price: newItem.price,
      quantity: 1,
      variant: newItem.size,
    });
  };

  const removeItem = (sku: string) => {
    setItems((prev) => prev.filter((item) => item.sku !== sku));
  };

  const updateQuantity = (sku: string, quantity: number) => {
    if (quantity <= 0) {
      analytics.removeFromCart({
        sku,
        name: items.find((item) => item.sku === sku)?.name || "",
        price: items.find((item) => item.sku === sku)?.price || 0,
        quantity: items.find((item) => item.sku === sku)?.quantity || 0,
      });
      removeItem(sku);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.sku === sku ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getGuestCartJson = (): string | null => {
    if (items.length === 0) return null;
    const payload = {
      items: items.map((i) => ({ sku: i.sku, quantity: i.quantity })),
    };
    return JSON.stringify(payload);
  };

  const replaceWithMergedCart = (mergedCartJson: string) => {
    try {
      const parsed = JSON.parse(mergedCartJson) as { items?: Array<{ sku?: string; quantity?: number }> };
      const rawItems = parsed?.items ?? [];
      if (rawItems.length === 0) {
        setItems([]);
        return;
      }
      const bySku = new Map(items.map((i) => [i.sku.toUpperCase(), i]));
      const next: CartItem[] = rawItems
        .filter((r) => r?.sku && (r.quantity ?? 0) > 0)
        .map((r) => {
          const sku = String(r.sku).trim();
          const key = sku.toUpperCase();
          const qty = Math.max(1, r.quantity ?? 1);
          const existing = bySku.get(key);
          if (existing) {
            return { ...existing, quantity: qty };
          }
          return {
            sku,
            name: `Product ${sku}`,
            price: 0,
            quantity: qty,
            groupSlug: "",
          } as CartItem;
        });
      setItems(next);
    } catch (e) {
      console.error("Failed to apply merged cart:", e);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const openCart = () => {
    const totalValue = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    analytics.viewCart(totalValue, items.length);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        replaceWithMergedCart,
        getGuestCartJson,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
