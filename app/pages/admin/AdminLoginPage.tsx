import { useState } from "react";
import { Link as RouterLink, Navigate, useNavigate } from "react-router";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { HonyaMark, ThemeToggle } from "../../shared/components";
import { useAuth } from "../../contexts/AuthContext";
import { honyaFetch } from "../../lib/api-client";
import type { PermissionsDto } from "../../models/admin";

export default function AdminLoginPage() {
  const nav = useNavigate();
  const { user, login, logout, hasFeature, permissionsLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user && !permissionsLoading && hasFeature("dashboard.access")) {
    return <Navigate to="/admin" replace />;
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError(null);
    try {
      await login({
        identifier: String(form.get("identifier") ?? "").trim(),
        password: String(form.get("password") ?? ""),
      });
      const permissions = await honyaFetch<PermissionsDto>("/auth/permissions");
      if (!permissions.features?.includes("dashboard.access")) {
        await logout();
        setError("That account does not have dashboard.access. Ask an admin to grant it.");
        return;
      }
      nav("/admin", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in. Is honya-api running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        bgcolor: "#0F2847",
        color: "#F7F2E6",
        position: "relative",
        overflow: "hidden",
        p: 2,
      }}
    >
      <Box className="honya-seigaiha" sx={{ position: "absolute", inset: 0, opacity: 0.18 }} />
      <Box sx={{ position: "absolute", top: 16, right: 16, zIndex: 1 }}>
        <ThemeToggle />
      </Box>
      <Container maxWidth="xs" sx={{ position: "relative" }}>
        <Box sx={{ bgcolor: "var(--honya-foam)", color: "var(--honya-ink)", border: "1px solid var(--honya-line-strong)", boxShadow: "10px 10px 0 var(--honya-shadow-strong)" }}>
          <Box className="honya-seigaiha" sx={{ height: 12 }} />
          <Box sx={{ p: { xs: 3, sm: 4 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <HonyaMark size={40} />
              <Box>
                <Typography variant="overline" sx={{ letterSpacing: "0.3em" }}>裏口 · BACK COUNTER</Typography>
                <Typography variant="h5" sx={{ lineHeight: 1.1 }}>Honya staff</Typography>
              </Box>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Sign in with an account whose role grants <strong>dashboard.access</strong>.
            </Typography>

            <Box component="form" onSubmit={submit} sx={{ display: "grid", gap: 2, mt: 2.5 }}>
              <TextField name="identifier" label="Email or member Nº" required fullWidth autoFocus />
              <TextField name="password" label="Password" type="password" required fullWidth />
              {error && (
                <Box role="alert" sx={{ p: 1.5, border: "1px solid #B5402A", bgcolor: "rgba(181,64,42,0.06)" }}>
                  <Typography variant="body2" color="secondary">{error}</Typography>
                </Box>
              )}
              {user && !hasFeature("dashboard.access") && !error && (
                <Typography variant="caption" color="text.secondary">
                  Signed in as {user.username}. This account has no dashboard access.
                </Typography>
              )}
              <Button type="submit" variant="contained" color="primary" size="large" disabled={loading}>
                {loading ? "Opening…" : "Enter the back counter"}
              </Button>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
              <Box component={RouterLink} to="/" style={{ fontSize: 13 }}>← Storefront</Box>
              <Box component={RouterLink} to="/login" style={{ fontSize: 13 }}>Customer log in</Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
