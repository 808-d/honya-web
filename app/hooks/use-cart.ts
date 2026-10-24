import { useCallback, useEffect, useState } from "react";
import { honyaFetch } from "../lib/api-client";
import type { CartDto, CartItemDto, CartMutationDto } from "../models/api";

// Cart data hook. The API endpoints require authentication, so `enabled` is
// driven by the current session; when disabled the cart stays empty and no
// requests are made.

export interface CartState {
  items: CartItemDto[];
  cartCount: number;
  loading: boolean;
  error: string | null;
  addItem: (productId: string, quantity?: number) => Promise<CartMutationDto>;
  removeItem: (itemId: number) => Promise<CartMutationDto>;
  refresh: () => Promise<void>;
}

function mergeItem(items: CartItemDto[], next: CartItemDto): CartItemDto[] {
  const index = items.findIndex((item) => item.id === next.id);
  if (index === -1) return [...items, next];
  const copy = items.slice();
  copy[index] = next;
  return copy;
}

export function useCartState(enabled: boolean): CartState {
  const [items, setItems] = useState<CartItemDto[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setItems([]);
      setCartCount(0);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const cart = await honyaFetch<CartDto>("/cart");
      setItems(cart.items ?? []);
      setCartCount(cart.cart_count ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your basket.");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addItem = useCallback(async (productId: string, quantity = 1) => {
    const result = await honyaFetch<CartMutationDto>("/cart/items", {
      method: "POST",
      body: { product_id: productId, quantity },
    });
    setItems((prev) => mergeItem(prev, result.item));
    setCartCount(result.cart_count);
    return result;
  }, []);

  const removeItem = useCallback(async (itemId: number) => {
    const result = await honyaFetch<CartMutationDto>(`/cart/items/${itemId}`, {
      method: "DELETE",
    });
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    setCartCount(result.cart_count);
    return result;
  }, []);

  return { items, cartCount, loading, error, addItem, removeItem, refresh };
}
