import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useCheckout } from "../hooks";

const PAYMENT_COD = 0;

function ErrorNote({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <Box role="alert" sx={{ p: 1.5, border: "1px solid #B5402A", bgcolor: "rgba(181,64,42,0.06)" }}>
      <Typography variant="body2" color="secondary">{children}</Typography>
    </Box>
  );
}

export default function CheckoutPage() {
  const nav = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { items, cartCount, loading: cartLoading, refresh } = useCart();
  const checkout = useCheckout();
  const [clientError, setClientError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setClientError(null);
    try {
      const order = await checkout.mutate({
        shipping_name: String(form.get("shipping_name") ?? "").trim(),
        shipping_phone: String(form.get("shipping_phone") ?? "").trim(),
        shipping_address: String(form.get("shipping_address") ?? "").trim(),
        note: String(form.get("note") ?? "").trim(),
        coupon_code: String(form.get("coupon_code") ?? "").trim(),
        payment_method: PAYMENT_COD,
      });
      await refresh();
      nav(`/orders/${order.id}`, { replace: true });
    } catch (err) {
      setClientError(err instanceof Error ? err.message : "Could not place your order.");
    }
  };

  if (authLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="body2" color="text.secondary">Loading the counter…</Typography>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: "center" }}>
        <Typography variant="overline" sx={{ letterSpacing: "0.3em" }}>会計 · CHECKOUT</Typography>
        <Typography variant="h4" sx={{ mt: 1 }}>The counter needs a name.</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Log in to place the volumes in your basket as an order.
        </Typography>
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center", mt: 3, flexWrap: "wrap" }}>
          <Button component={RouterLink} to="/login" variant="contained" color="primary">Log in</Button>
          <Button component={RouterLink} to="/cart" variant="outlined">Back to basket</Button>
        </Box>
      </Container>
    );
  }

  if (cartLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="body2" color="text.secondary">Fetching your basket…</Typography>
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: "center" }}>
        <ShoppingBasketIcon sx={{ fontSize: 44, opacity: 0.5 }} />
        <Typography variant="h4" sx={{ mt: 1 }}>There is nothing to settle.</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Add a volume to your basket, then come back to place the order.
        </Typography>
        <Button component={RouterLink} to="/products" variant="contained" color="primary" sx={{ mt: 3 }}>
          Browse shelves
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3 } }}>
      <Typography variant="overline" sx={{ letterSpacing: "0.3em" }}>会計 · CHECKOUT</Typography>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 2, flexWrap: "wrap" }}>
        <Typography variant="h3" sx={{ fontSize: { xs: "1.7rem", sm: "2.4rem" } }}>Place your order</Typography>
        <Typography variant="body2" color="text.secondary">
          {cartCount} {cartCount === 1 ? "volume" : "volumes"} ready
        </Typography>
      </Box>

      <Box
        sx={{
          mt: 3,
          display: "grid",
          gap: 2.5,
          alignItems: "start",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 340px" },
        }}
      >
        <Box component="form" onSubmit={submit} sx={{ bgcolor: "var(--honya-foam)", border: "1px solid var(--honya-line-strong)", p: { xs: 2, sm: 3 }, boxShadow: "6px 6px 0 var(--honya-shadow)" }}>
          <Typography variant="h5">Where should it go?</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            The counter wraps each order by hand. Give us a reachable address.
          </Typography>

          <Box sx={{ display: "grid", gap: 2, mt: 2.5 }}>
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
              <TextField
                name="shipping_name"
                label="Recipient name"
                defaultValue={user.display_name || user.username}
                required
                fullWidth
              />
              <TextField
                name="shipping_phone"
                label="Phone"
                defaultValue={user.phone ?? ""}
                placeholder="+81 90 1234 5678"
                required
                fullWidth
              />
            </Box>
            <TextField
              name="shipping_address"
              label="Shipping address"
              placeholder="Street, city, postal code, country"
              required
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              name="note"
              label="Note to the counter"
              placeholder="Leave it with the concierge, gate code, etc."
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              name="coupon_code"
              label="Coupon code"
              placeholder="Optional"
              fullWidth
            />

            <Box sx={{ border: "1px solid var(--honya-line-strong)", p: 2, display: "flex", gap: 1.5, alignItems: "flex-start" }}>
              <LocalShippingIcon sx={{ color: "#C19A5B", mt: 0.25 }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Cash on delivery</Typography>
                <Typography variant="caption" color="text.secondary">
                  Pay the courier when the parcel arrives. This is the only payment method offered.
                </Typography>
              </Box>
            </Box>

            <ErrorNote>{clientError ?? checkout.error}</ErrorNote>

            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={checkout.loading}
              >
                {checkout.loading ? "Placing order…" : "Place order"}
              </Button>
              <Button component={RouterLink} to="/cart" variant="outlined" size="large">
                Back to basket
              </Button>
            </Box>
          </Box>
        </Box>

        <Box sx={{ bgcolor: "#0F2847", color: "#F7F2E6", p: 2.5, boxShadow: "6px 6px 0 rgba(22,32,46,0.25)" }}>
          <Typography variant="overline" sx={{ letterSpacing: "0.25em", opacity: 0.75 }}>籠 · ORDER SUMMARY</Typography>
          <Box sx={{ display: "grid", gap: 1.5, mt: 1.5 }}>
            {items.map((item) => (
              <Box key={item.id} sx={{ display: "flex", gap: 1.25, alignItems: "center" }}>
                <Box
                  sx={{
                    width: 38,
                    height: 52,
                    flexShrink: 0,
                    bgcolor: "rgba(247,242,230,0.12)",
                    border: "1px solid rgba(247,242,230,0.25)",
                    overflow: "hidden",
                  }}
                >
                  {item.cover ? (
                    <Box component="img" src={item.cover} alt={item.title} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : null}
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="body2" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>×{item.quantity}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
          <Divider sx={{ my: 2, borderColor: "rgba(247,242,230,0.2)" }} />
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            The counter prices your basket, applies any coupon, and adds delivery when the order is placed.
          </Typography>
          <Typography variant="caption" sx={{ display: "block", mt: 1, opacity: 0.6 }}>
            Totals appear on the confirmation that follows.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
