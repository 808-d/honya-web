import { honyaFetch } from "../lib/api-client";
import { useAsync, useAsyncMutation } from "./use-async";
import type { CreateOrderInput, ListDto, OrderDto } from "../models/api";

// Order hooks. POST /orders performs checkout against the user's server-side
// cart (and clears it on success). All endpoints require the auth cookie, so
// only render consumers once the session is known.

export function useCheckout() {
  return useAsyncMutation<CreateOrderInput, OrderDto>((input) =>
    honyaFetch<OrderDto>("/orders", { method: "POST", body: input }),
  );
}

export interface OrderQuery {
  status?: number;
  page?: number;
  perPage?: number;
}

export function useOrders(query: OrderQuery = {}) {
  const key = JSON.stringify(query);
  return useAsync<ListDto<OrderDto>>(`orders:${key}`, (signal) =>
    honyaFetch<ListDto<OrderDto>>("/orders", {
      query: {
        status: query.status,
        page: query.page,
        per_page: query.perPage,
      },
      signal,
    }),
  );
}

export function useOrder(id: string | undefined) {
  return useAsync<OrderDto>(`order:${id}`, async (signal) => {
    if (!id) throw new Error("Missing order id");
    return honyaFetch<OrderDto>(`/orders/${encodeURIComponent(id)}`, { signal });
  });
}

export function useCancelOrder() {
  return useAsyncMutation<string, OrderDto>((id) =>
    honyaFetch<OrderDto>(`/orders/${encodeURIComponent(id)}/cancel`, { method: "POST" }),
  );
}

export function useReceiveOrder() {
  return useAsyncMutation<string, OrderDto>((id) =>
    honyaFetch<OrderDto>(`/orders/${encodeURIComponent(id)}/receive`, { method: "POST" }),
  );
}
