import { honyaFetch } from "../lib/api-client";
import { useAsync, useAsyncMutation } from "./use-async";
import type { ListDto } from "../models/api";
import type { AdminUserDto, FeatureDto, RoleDto, RoleInput } from "../models/admin";

export function useRoles() {
  return useAsync<RoleDto[]>("admin:roles", (signal) =>
    honyaFetch<RoleDto[]>("/admin/roles", { signal }),
  );
}

export function useFeatures() {
  return useAsync<FeatureDto[]>("admin:features", (signal) =>
    honyaFetch<FeatureDto[]>("/admin/features", { signal }),
  );
}

export function useCreateRole() {
  return useAsyncMutation<RoleInput, RoleDto>((input) =>
    honyaFetch<RoleDto>("/admin/roles", { method: "POST", body: input }),
  );
}

export function useUpdateRole() {
  return useAsyncMutation<{ id: string; input: RoleInput }, RoleDto>(({ id, input }) =>
    honyaFetch<RoleDto>(`/admin/roles/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: input,
    }),
  );
}

export function useDeleteRole() {
  return useAsyncMutation<string, null>((id) =>
    honyaFetch<null>(`/admin/roles/${encodeURIComponent(id)}`, { method: "DELETE" }),
  );
}

export interface AdminUserQuery {
  search?: string;
  page?: number;
  perPage?: number;
}

export function useAdminUsers(query: AdminUserQuery = {}) {
  const key = JSON.stringify(query);
  return useAsync<ListDto<AdminUserDto>>(`admin:users:${key}`, (signal) =>
    honyaFetch<ListDto<AdminUserDto>>("/admin/users", {
      query: {
        search: query.search,
        page: query.page,
        per_page: query.perPage ?? 20,
      },
      signal,
    }),
  );
}

export function useUpdateUserRoles() {
  return useAsyncMutation<{ id: string; roleIds: string[] }, AdminUserDto>(({ id, roleIds }) =>
    honyaFetch<AdminUserDto>(`/admin/users/${encodeURIComponent(id)}/roles`, {
      method: "PUT",
      body: { role_ids: roleIds },
    }),
  );
}
