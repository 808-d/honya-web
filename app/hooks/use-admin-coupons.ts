import { honyaFetch } from "../lib/api-client";
import { useAsync, useAsyncMutation } from "./use-async";
import type { ListDto } from "../models/api";
import type { CouponDto, CouponInput, CouponUsageDto } from "../models/admin";

export interface AdminCouponQuery {
  search?: string;
  type?: number;
  active?: boolean;
  page?: number;
  perPage?: number;
}

export function useAdminCoupons(query: AdminCouponQuery = {}) {
  const key = JSON.stringify(query);
  return useAsync<ListDto<CouponDto>>(`admin:coupons:${key}`, (signal) =>
    honyaFetch<ListDto<CouponDto>>("/coupons", {
      query: {
        search: query.search,
        type: query.type,
        active: query.active,
        page: query.page,
        per_page: query.perPage ?? 20,
      },
      signal,
    }),
  );
}

export function useCoupon(id: string | undefined) {
  return useAsync<CouponDto>(`admin:coupon:${id}`, async (signal) => {
    if (!id) throw new Error("Missing coupon id");
    return honyaFetch<CouponDto>(`/coupons/${encodeURIComponent(id)}`, { signal });
  });
}

export function useCouponUsages(id: string | undefined, page = 1) {
  return useAsync<ListDto<CouponUsageDto>>(`admin:coupon-usages:${id}:${page}`, async (signal) => {
    if (!id) throw new Error("Missing coupon id");
    return honyaFetch<ListDto<CouponUsageDto>>(`/coupons/${encodeURIComponent(id)}/usages`, {
      query: { page, per_page: 20 },
      signal,
    });
  });
}

export function useCreateCoupon() {
  return useAsyncMutation<CouponInput, CouponDto>((input) =>
    honyaFetch<CouponDto>("/coupons", { method: "POST", body: input }),
  );
}

export function useUpdateCoupon() {
  return useAsyncMutation<{ id: string; input: CouponInput }, CouponDto>(({ id, input }) =>
    honyaFetch<CouponDto>(`/coupons/${encodeURIComponent(id)}`, { method: "PUT", body: input }),
  );
}

export function useDeleteCoupon() {
  return useAsyncMutation<string, null>((id) =>
    honyaFetch<null>(`/coupons/${encodeURIComponent(id)}`, { method: "DELETE" }),
  );
}
