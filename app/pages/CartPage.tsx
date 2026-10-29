import { useState } from "react";
import { Link as RouterLink } from "react-router";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const { items, cartCount, loading, error, removeItem } = useCart();
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const handleRemove = async (itemId: number) => {
    setPendingId(itemId);
    setRemoveError(null);
    try {
      await removeItem(itemId);
    } catch (err) {
      setRemoveError(err instanceof Error ? err.message : "Could not remove that item.");
    } finally {
      setPendingId(null);
    }
  };

  if (authLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="body2" color="text.secondary">Loading your basket…</Typography>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: "center" }}>
        <Typography variant="overline" sx={{ letterSpacing: "0.3em" }}>籠 · BASKET</Typography>
        <Typography variant="h4" sx={{ mt: 1 }}>Your basket is behind the counter.</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Log in to add volumes and keep them between visits.
        </Typography>
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center", mt: 3, flexWrap: "wrap" }}>
          <Button component={RouterLink} to="/login" variant="contained" color="primary">Log in</Button>
          <Button component={RouterLink} to="/products" variant="outlined">Browse shelves</Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3 } }}>
      <Typography variant="overline" sx={{ letterSpacing: "0.3em" }}>籠 · BASKET</Typography>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 2, flexWrap: "wrap" }}>
        <Typography variant="h3" sx={{ fontSize: { xs: "1.7rem", sm: "2.4rem" } }}>Your basket</Typography>
        <Typography variant="body2" color="text.secondary">
          {cartCount} {cartCount === 1 ? "volume" : "volumes"}
        </Typography>
      </Box>

      {(error || removeError) && (
        <Box role="alert" sx={{ mt: 2, p: 1.5, border: "1px solid #B5402A", bgcolor: "rgba(181,64,42,0.06)" }}>
          <Typography variant="body2" color="secondary">{removeError ?? error}</Typography>
        </Box>
      )}

      {loading ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>Fetching your basket…</Typography>
      ) : items.length === 0 ? (
        <Box sx={{ mt: 3, p: 4, textAlign: "center", border: "1px dashed var(--honya-line-strong)", bgcolor: "var(--honya-foam)" }}>
          <ShoppingBasketIcon sx={{ fontSize: 40, opacity: 0.5 }} />
          <Typography variant="h6" sx={{ mt: 1 }}>Nothing in the basket yet.</Typography>
          <Typography variant="body2" color="text.secondary">Add a volume from the shelves and it will wait here.</Typography>
          <Button component={RouterLink} to="/products" variant="contained" color="primary" sx={{ mt: 2 }}>
            Browse shelves
          </Button>
        </Box>
      ) : (
        <Box sx={{ mt: 3, bgcolor: "var(--honya-foam)", border: "1px solid var(--honya-line)", boxShadow: "6px 6px 0 var(--honya-shadow)" }}>
          {items.map((item, index) => (
            <Box key={item.id}>
              {index > 0 && <Divider />}
              <Box sx={{ display: "flex", gap: 2, alignItems: "center", p: { xs: 1.5, sm: 2 } }}>
                <Box
                  sx={{
                    width: { xs: 52, sm: 64 },
                    height: { xs: 74, sm: 92 },
                    flexShrink: 0,
                    bgcolor: "#0F2847",
                    color: "#F7F2E6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    border: "1px solid var(--honya-line)",
                  }}
                >
                  {item.cover ? (
                    <Box component="img" src={item.cover} alt={item.title} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <Typography variant="h5" sx={{ fontFamily: '"Shippori Mincho B1", serif', opacity: 0.8 }}>
                      {item.title.slice(0, 1)}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="h6" sx={{ fontSize: { xs: "1rem", sm: "1.15rem" }, lineHeight: 1.3 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Qty {item.quantity}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Added {new Date(item.create_time).toLocaleDateString()}
                  </Typography>
                </Box>
                <IconButton
                  aria-label={`Remove ${item.title}`}
                  onClick={() => handleRemove(item.id)}
                  disabled={pendingId === item.id}
                  sx={{ alignSelf: "flex-start" }}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <Box sx={{ display: "flex", gap: 1.5, mt: 3, flexWrap: "wrap" }}>
        <Button component={RouterLink} to="/products" variant="outlined">Continue browsing</Button>
        {items.length > 0 && (
          <Button component={RouterLink} to="/checkout" variant="contained" color="primary">Proceed to checkout</Button>
        )}
      </Box>
    </Container>
  );
}
