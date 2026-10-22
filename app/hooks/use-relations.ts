import { useMemo } from "react";
import { useAsync } from "./use-async";
import { emptyRelations, fetchAllRelations } from "../lib/catalog";
import type { CatalogRelations } from "../lib/catalog";

// Relations rarely change, so the network request is shared process-wide.
let pending: Promise<CatalogRelations> | null = null;

function loadRelations(): Promise<CatalogRelations> {
  if (!pending) {
    pending = fetchAllRelations().catch((err) => {
      pending = null;
      throw err;
    });
  }
  return pending;
}

export function useRelations() {
  const query = useAsync<CatalogRelations>("catalog:relations", () => loadRelations());
  const relations = useMemo(() => query.data ?? emptyRelations, [query.data]);
  return { relations, loading: query.loading, error: query.error, refetch: query.refetch };
}
