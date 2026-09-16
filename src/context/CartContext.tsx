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
  decrement: (productId: string, variant?: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  quantityOf: (productId: string, variant?: string) => number;
  count: number;
  total: number;
  bump: number;
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

  const [bump, setBump] = useState(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const add = useCallback((productId: string, quantity = 1, variant?: string) => {
    const key = itemKey(productId, variant);
    setItems((prev) => {
      const found = prev.find((item) => item.key === key);
      if (found) {
        return prev.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + quantity } : item,
        );
      }
      return [...prev, { key, productId, quantity, variant }];
    });
    setBump((n) => n + 1);
  }, []);

  const decrement = useCallback((productId: string, variant?: string) => {
    setItems((prev) => {
      const target = variant
        ? prev.find((item) => item.productId === productId && item.variant === variant)
        : [...prev].reverse().find((item) => item.productId === productId);
      if (!target) return prev;
      if (target.quantity <= 1) return prev.filter((item) => item.key !== target.key);
      return prev.map((item) =>
        item.key === target.key ? { ...item, quantity: item.quantity - 1 } : item,
      );
    });
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

  const quantityOf = useCallback(
    (productId: string, variant?: string) =>
      items
        .filter((item) => item.productId === productId && (variant == null || item.variant === variant))
        .reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({ items, add, decrement, setQuantity, remove, clear, quantityOf, count, total, bump }),
    [items, add, decrement, setQuantity, remove, clear, quantityOf, count, total, bump],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
