import { Link as RouterLink, useNavigate } from "react-router";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { dummyNotices } from "../dummy_data/users";

export default function ProfilePage() {
  const nav = useNavigate();
  const { user, loading, logout } = useAuth();
  const { items, cartCount } = useCart();

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="body2" color="text.secondary">Loading your account…</Typography>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: "center" }}>
        <Typography variant="overline" sx={{ letterSpacing: "0.3em" }}>利用者 · READER</Typography>
        <Typography variant="h4" sx={{ mt: 1 }}>No card on the counter.</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Log in to see the account tied to your access token.
        </Typography>
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center", mt: 3, flexWrap: "wrap" }}>
          <Button component={RouterLink} to="/login" variant="contained" color="primary">Log in</Button>
          <Button component={RouterLink} to="/register" variant="outlined">Create account</Button>
        </Box>
      </Container>
    );
  }

  const name = user.display_name || user.username;

  const details: Array<[string, string]> = [
    ["Member Nº", user.id],
    ["Username", user.username],
    ["Display name", user.display_name || "—"],
    ["Email", user.email],
    ["Phone", user.phone || "—"],
    ["Roles", user.roles?.length ? user.roles.join(", ") : "—"],
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography variant="overline" sx={{ letterSpacing: "0.3em" }}>利用者 · READER</Typography>
      <Typography variant="h3" sx={{ fontSize: { xs: "1.7rem", sm: "2.4rem" } }}>My account</Typography>

      <Box sx={{ display: "grid", gap: 2.5, mt: 3, gridTemplateColumns: { xs: "1fr", md: "360px 1fr" } }}>
        {/* Member card — live credentials from GET /auth/me */}
        <Box sx={{ bgcolor: "#0F2847", color: "#F7F2E6", p: 3, boxShadow: "6px 6px 0 var(--honya-shadow-strong)", position: "relative", overflow: "hidden" }}>
          <Box className="honya-seigaiha" sx={{ position: "absolute", inset: 0, opacity: 0.35 }} />
          <Box sx={{ position: "relative" }}>
            <Typography variant="caption" sx={{ letterSpacing: "0.3em", opacity: 0.7 }}>貸出カード · HONYA MEMBER</Typography>
            <Typography variant="h5" sx={{ mt: 1 }}>{name}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>@{user.username} · {user.email}</Typography>
            {user.phone && (
              <Typography variant="body2" sx={{ opacity: 0.7 }}>{user.phone}</Typography>
            )}
            {user.roles && user.roles.length > 0 && (
              <Box sx={{ display: "flex", gap: 0.75, mt: 1.5, flexWrap: "wrap" }}>
                {user.roles.map((role) => (
                  <Chip key={role} size="small" label={role} variant="outlined" sx={{ color: "#F7F2E6", borderColor: "rgba(247,242,230,0.4)" }} />
                ))}
              </Box>
            )}
            <Box sx={{ display: "flex", gap: 3, mt: 2 }}>
              <Box>
                <Typography variant="h6">{cartCount}</Typography>
                <Typography variant="caption">in basket</Typography>
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontSize: "0.95rem", wordBreak: "break-all" }}>{user.id}</Typography>
                <Typography variant="caption">member Nº</Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
              <Button component={RouterLink} to="/orders" size="small" variant="contained" color="secondary">My orders</Button>
              <Button component={RouterLink} to="/products" size="small" variant="outlined" sx={{ color: "#F7F2E6", borderColor: "rgba(247,242,230,0.4)" }}>Browse shelves</Button>
              <Button
                size="small"
                variant="outlined"
                sx={{ color: "#F7F2E6", borderColor: "rgba(247,242,230,0.4)" }}
                onClick={() => { logout(); nav("/"); }}
              >
                Log out
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Basket + notices */}
        <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
          <Box sx={{ bgcolor: "var(--honya-foam)", border: "1px solid var(--honya-line)", p: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1 }}>
              <Typography variant="overline">籠 · IN YOUR BASKET</Typography>
              <Typography variant="caption" color="text.secondary">{cartCount}</Typography>
            </Box>
            {items.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                Nothing waiting at the counter yet.
              </Typography>
            ) : (
              <Box sx={{ display: "grid", gap: 1.25, mt: 1.5 }}>
                {items.slice(0, 3).map((item) => (
                  <Box key={item.id} sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                    <Typography variant="body2" sx={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">×{item.quantity}</Typography>
                  </Box>
                ))}
              </Box>
            )}
            <Box sx={{ display: "flex", gap: 1, mt: 1.5, flexWrap: "wrap" }}>
              <Button component={RouterLink} to="/cart" size="small" variant="outlined">Open basket</Button>
              {items.length > 0 && (
                <Button component={RouterLink} to="/checkout" size="small" variant="contained" color="primary">
                  Checkout
                </Button>
              )}
            </Box>
          </Box>

          <Box className="honya-ruled" sx={{ bgcolor: "var(--honya-foam)", border: "1px solid var(--honya-line)", p: 2.5 }}>
            <Typography variant="overline">連絡 · COUNTER NOTICES</Typography>
            <Box sx={{ display: "grid", gap: 1.5, mt: 1.5 }}>
              {dummyNotices.map((n) => (
                <Box key={n.id} sx={{ display: "flex", gap: 1.5 }}>
                  <Chip size="small" label={n.label} color="secondary" variant="outlined" />
                  <Box>
                    <Typography variant="body2">{n.text}</Typography>
                    <Typography variant="caption" color="text.secondary">{n.date}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Account details — straight from the token / MeResponse */}
      <Typography variant="h5" sx={{ mt: 5, mb: 1.5 }}>Account details</Typography>
      <Box sx={{ bgcolor: "var(--honya-foam)", border: "1px solid var(--honya-line)" }}>
        {details.map(([label, value], index) => (
          <Box
            key={label}
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "baseline",
              p: 2,
              borderTop: index ? "1px dotted var(--honya-line-strong)" : "none",
              flexWrap: "wrap",
            }}
          >
            <Typography variant="caption" sx={{ letterSpacing: "0.15em", minWidth: 110 }}>{label}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: "break-word", flex: 1 }}>{value}</Typography>
          </Box>
        ))}
      </Box>
    </Container>
  );
}
