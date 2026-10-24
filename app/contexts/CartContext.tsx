import { createContext, useContext } from "react";
import { useAuth } from "./AuthContext";
import { useCartState } from "../hooks/use-cart";
import type { CartState } from "../hooks/use-cart";

const CartContext = createContext<CartState | null>(null);

/** Loads the signed-in user's cart from honya-api and shares it app-wide. */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const cart = useCartState(Boolean(user));
  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
