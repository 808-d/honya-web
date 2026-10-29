import { honyaFetch } from "../lib/api-client";
import { useAsync, useAsyncMutation } from "./use-async";
import type { ListDto, OrderDto } from "../models/api";

export interface AdminOrderQuery {
  status?: number;
  paymentStatus?: number;
  page?: number;
  perPage?: number;
}

export function useAdminOrders(query: AdminOrderQuery = {}) {
  const key = JSON.stringify(query);
  return useAsync<ListDto<OrderDto>>(`admin:orders:${key}`, (signal) =>
    honyaFetch<ListDto<OrderDto>>("/admin/orders", {
      query: {
        status: query.status,
        payment_status: query.paymentStatus,
        page: query.page,
        per_page: query.perPage ?? 20,
      },
      signal,
    }),
  );
}

export function useAdminOrder(id: string | undefined) {
  return useAsync<OrderDto>(`admin:order:${id}`, async (signal) => {
    if (!id) throw new Error("Missing order id");
    return honyaFetch<OrderDto>(`/admin/orders/${encodeURIComponent(id)}`, { signal });
  });
}

export function useUpdateOrderStatus() {
  return useAsyncMutation<{ id: string; status: number }, OrderDto>(({ id, status }) =>
    honyaFetch<OrderDto>(`/admin/orders/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      body: { status },
    }),
  );
}

export function useUpdateOrderPayment() {
  return useAsyncMutation<{ id: string; paymentStatus: number }, OrderDto>(
    ({ id, paymentStatus }) =>
      honyaFetch<OrderDto>(`/admin/orders/${encodeURIComponent(id)}/payment`, {
        method: "PATCH",
        body: { payment_status: paymentStatus },
      }),
  );
}
