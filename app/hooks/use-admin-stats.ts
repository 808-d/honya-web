import { honyaFetch } from "../lib/api-client";
import { useAsync } from "./use-async";
import type { StatsDto } from "../models/admin";

export function useAdminStats() {
  return useAsync<StatsDto>("admin:stats", (signal) =>
    honyaFetch<StatsDto>("/admin/stats", { signal }),
  );
}
