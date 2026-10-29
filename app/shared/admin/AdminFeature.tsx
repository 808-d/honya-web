import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useAuth } from "../../contexts/AuthContext";

/** Keeps a direct URL from mounting admin data hooks without the feature. */
export function AdminFeature({ feature, children }: { feature: string; children: ReactNode }) {
  const { hasFeature, permissionsLoading } = useAuth();

  if (permissionsLoading) {
    return <Typography variant="body2" color="text.secondary">Checking access…</Typography>;
  }

  if (!hasFeature(feature)) {
    return (
      <Box sx={{ maxWidth: 560, bgcolor: "var(--honya-foam)", border: "1px solid var(--honya-line-strong)", p: 3, boxShadow: "5px 5px 0 var(--honya-shadow)" }}>
        <Typography variant="overline" sx={{ letterSpacing: "0.24em", color: "text.secondary" }}>LIMITED PASS</Typography>
        <Typography variant="h5" sx={{ mt: 0.5 }}>This drawer is locked.</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Your roles do not include <strong>{feature}</strong>. Ask an admin to grant it, or head back to the dashboard.
        </Typography>
        <Button component={RouterLink} to="/admin" variant="outlined" sx={{ mt: 2 }}>Back to dashboard</Button>
      </Box>
    );
  }

  return <>{children}</>;
}
