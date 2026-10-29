import { useCallback, useEffect, useState } from "react";
import { honyaFetch } from "../lib/api-client";
import type { PermissionsDto } from "../models/admin";

export interface PermissionsState {
  roles: string[];
  features: string[];
  permissionsLoading: boolean;
  permissionsError: string | null;
  hasFeature: (code: string) => boolean;
  refreshPermissions: () => Promise<void>;
}

/**
 * Live role/feature set for the signed-in user. Unlike /auth/me (JWT claims),
 * this endpoint reads the database, so grants apply without a new login.
 */
export function usePermissionsState(userId: string | null): PermissionsState {
  const [roles, setRoles] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshPermissions = useCallback(async () => {
    if (!userId) {
      setRoles([]);
      setFeatures([]);
      setLoading(false);
      setLoadedUserId(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await honyaFetch<PermissionsDto>("/auth/permissions");
      setRoles(result.roles ?? []);
      setFeatures(result.features ?? []);
    } catch (err) {
      setRoles([]);
      setFeatures([]);
      setError(err instanceof Error ? err.message : "Could not load permissions.");
    } finally {
      setLoading(false);
      setLoadedUserId(userId);
    }
  }, [userId]);

  useEffect(() => {
    void refreshPermissions();
  }, [refreshPermissions]);

  const hasFeature = useCallback((code: string) => features.includes(code), [features]);

  const permissionsLoading = loading || (userId !== null && loadedUserId !== userId);

  return { roles, features, permissionsLoading, permissionsError: error, hasFeature, refreshPermissions };
}
