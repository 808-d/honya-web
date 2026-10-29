import { honyaFetch } from "../lib/api-client";
import { useAsync, useAsyncMutation } from "./use-async";
import type { ListDto, NameDto, ProductDto } from "../models/api";
import type { ProductInput } from "../models/admin";

export interface AdminProductQuery {
  status?: number;
  type?: number;
  search?: string;
  page?: number;
  perPage?: number;
}

export function useAdminProducts(query: AdminProductQuery = {}) {
  const key = JSON.stringify(query);
  return useAsync<ListDto<ProductDto>>(`admin:products:${key}`, (signal) =>
    honyaFetch<ListDto<ProductDto>>("/products", {
      query: {
        status: query.status,
        type: query.type,
        search: query.search,
        page: query.page,
        per_page: query.perPage ?? 20,
      },
      signal,
    }),
  );
}

export function useAdminProduct(id: string | undefined) {
  return useAsync<ProductDto>(`admin:product:${id}`, async (signal) => {
    if (!id) throw new Error("Missing product id");
    return honyaFetch<ProductDto>(`/products/${encodeURIComponent(id)}`, { signal });
  });
}

export function useCreateProduct() {
  return useAsyncMutation<ProductInput, ProductDto>((input) =>
    honyaFetch<ProductDto>("/products", { method: "POST", body: input }),
  );
}

export function useUpdateProduct() {
  return useAsyncMutation<{ id: string; input: ProductInput }, ProductDto>(({ id, input }) =>
    honyaFetch<ProductDto>(`/products/${encodeURIComponent(id)}`, { method: "PUT", body: input }),
  );
}

export function useDeleteProduct() {
  return useAsyncMutation<string, null>((id) =>
    honyaFetch<null>(`/products/${encodeURIComponent(id)}`, { method: "DELETE" }),
  );
}

export const NAME_RESOURCES = {
  authors: "/authors",
  genres: "/genres",
  publishers: "/publishers",
  tags: "/tags",
} as const;

export type NameResource = keyof typeof NAME_RESOURCES;

export function useNameList(resource: NameResource) {
  return useAsync<ListDto<NameDto>>(`admin:names:${resource}`, (signal) =>
    honyaFetch<ListDto<NameDto>>(NAME_RESOURCES[resource], {
      query: { per_page: 100 },
      signal,
    }),
  );
}

export function useCreateName(resource: NameResource) {
  return useAsyncMutation<{ name: string }, NameDto>((input) =>
    honyaFetch<NameDto>(NAME_RESOURCES[resource], { method: "POST", body: input }),
  );
}

export function useUpdateName(resource: NameResource) {
  return useAsyncMutation<{ id: string; name: string }, NameDto>(({ id, name }) =>
    honyaFetch<NameDto>(`${NAME_RESOURCES[resource]}/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: { name },
    }),
  );
}

export function useDeleteName(resource: NameResource) {
  return useAsyncMutation<string, null>((id) =>
    honyaFetch<null>(`${NAME_RESOURCES[resource]}/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
  );
}
