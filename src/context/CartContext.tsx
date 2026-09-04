import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { productById } from "../data/catalog";
import type { CartItem } from "../types";

type CartContextValue = {
  items: CartItem[];
  add: (productId: string, quantity?: number, variant?: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  count: number;
  total: number;
  toast: string | null;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "mona-lissa-cart";

function itemKey(productId: string, variant?: string): string {
  return variant ? `${productId}::${variant}` : productId;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const add = useCallback((productId: string, quantity = 1, variant?: string) => {
    const key = itemKey(productId, variant);
    const product = productById[productId];
    setItems((prev) => {
      const found = prev.find((item) => item.key === key);
      if (found) {
        return prev.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + quantity } : item,
        );
      }
      return [...prev, { key, productId, quantity, variant }];
    });
    setToast(product?.name ?? "Producto sumado");
    window.setTimeout(() => setToast(null), 1800);
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0 ? prev.filter((item) => item.key !== key) : prev.map((item) => (item.key === key ? { ...item, quantity } : item)),
    );
  }, []);

  const remove = useCallback((key: string) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const product = productById[item.productId];
        return sum + (product?.price ?? 0) * item.quantity;
      }, 0),
    [items],
  );

  const value = useMemo(
    () => ({ items, add, setQuantity, remove, clear, count, total, toast }),
    [items, add, setQuantity, remove, clear, count, total, toast],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
