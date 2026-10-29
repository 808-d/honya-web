import { useState } from "react";
import { Link as RouterLink } from "react-router";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Pagination from "@mui/material/Pagination";
import Typography from "@mui/material/Typography";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { useAuth } from "../contexts/AuthContext";
import { useOrders } from "../hooks";
import { formatDate, formatMoney } from "../lib/format";
import {
  ORDER_STATUS_COLOR,
  PAYMENT_STATUS_COLOR,
  orderStatusLabel,
  paymentStatusLabel,
} from "../models/order";
import type { OrderDto } from "../models/api";

const PER_PAGE = 10;

const TRACKING_HINT: Record<number, string> = {
  0: "Waiting for the counter to confirm your order.",
  1: "Confirmed — we are getting your volumes together.",
  2: "Being prepared at the back counter.",
  3: "On its way to you.",
  4: "Delivered. Enjoy the read.",
  5: "This order was cancelled.",
  6: "This order was refunded.",
};

function OrderCard({ order }: { order: OrderDto }) {
  return (
    <Box
      sx={{
        bgcolor: "var(--honya-foam)",
        border: "1px solid var(--honya-line-strong)",
        boxShadow: "5px 5px 0 var(--honya-shadow)",
        p: { xs: 2, sm: 2.5 },
        display: "grid",
        gap: 2,
        gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr auto" },
        alignItems: "center",
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ReceiptLongIcon fontSize="small" sx={{ color: "text.secondary" }} />
          <Typography variant="overline" sx={{ letterSpacing: "0.18em" }}>
            ORDER Nº {order.id.slice(0, 8).toUpperCase()}
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ mt: 0.5, fontSize: { xs: "1.05rem", sm: "1.15rem" } }}>
          {orderStatusLabel(order.status)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Placed {formatDate(order.create_time)}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          {TRACKING_HINT[order.status] ?? "Status unavailable."}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", alignItems: "center" }}>
        <Chip size="small" variant="outlined" label={orderStatusLabel(order.status)} color={ORDER_STATUS_COLOR[order.status] ?? "default"} />
        <Chip
          size="small"
          variant="outlined"
          label={`Payment: ${paymentStatusLabel(order.payment_status)}`}
          color={PAYMENT_STATUS_COLOR[order.payment_status] ?? "default"}
        />
        {order.status >= 1 && order.status <= 3 && (
          <Chip size="small" variant="outlined" icon={<LocalShippingIcon />} label="In progress" />
        )}
      </Box>

      <Box sx={{ textAlign: { xs: "left", md: "right" }, display: "grid", gap: 1, justifyItems: { xs: "start", md: "end" } }}>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>Total</Typography>
          <Typography variant="h6">{formatMoney(order.total)}</Typography>
        </Box>
        <Button component={RouterLink} to={`/orders/${order.id}`} variant="outlined" size="small">
          View &amp; track
        </Button>
      </Box>
    </Box>
  );
}

function OrdersList() {
  const [page, setPage] = useState(1);
  const orders = useOrders({ page, perPage: PER_PAGE });
  const total = orders.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3 } }}>
      <Typography variant="overline" sx={{ letterSpacing: "0.3em" }}>注文 · ORDERS</Typography>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 2, flexWrap: "wrap" }}>
        <Typography variant="h3" sx={{ fontSize: { xs: "1.7rem", sm: "2.4rem" } }}>Your orders</Typography>
        <Typography variant="body2" color="text.secondary">
          {total} {total === 1 ? "order" : "orders"} on the ledger
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 620 }}>
        Follow each order from the counter to your shelf. Open an order to see its volumes, delivery details, and current status.
      </Typography>

      {orders.error && (
        <Box role="alert" sx={{ mt: 3, p: 2, border: "1px solid #B5402A", bgcolor: "rgba(181,64,42,0.06)" }}>
          <Typography variant="body2" color="secondary">{orders.error}</Typography>
        </Box>
      )}

      {orders.loading && !orders.data && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>Fetching your orders…</Typography>
      )}

      {!orders.loading && !orders.error && total === 0 && (
        <Box sx={{ mt: 4, bgcolor: "var(--honya-foam)", border: "1px solid var(--honya-line)", p: { xs: 3, sm: 5 }, textAlign: "center" }}>
          <ReceiptLongIcon sx={{ fontSize: 44, opacity: 0.45 }} />
          <Typography variant="h5" sx={{ mt: 1 }}>The ledger is blank.</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Once you place an order, it will appear here so you can track it.
          </Typography>
          <Button component={RouterLink} to="/products" variant="contained" color="primary" sx={{ mt: 3 }}>
            Browse shelves
          </Button>
        </Box>
      )}

      {total > 0 && (
        <Box sx={{ display: "grid", gap: 2, mt: 3 }}>
          {(orders.data?.items ?? []).map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </Box>
      )}

      {pages > 1 && (
        <>
          <Divider sx={{ mt: 4, mb: 2 }} />
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Pagination count={pages} page={page} onChange={(_, next) => setPage(next)} color="primary" />
          </Box>
        </>
      )}
    </Container>
  );
}

export default function OrdersPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="body2" color="text.secondary">Loading your account…</Typography>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: "center" }}>
        <Typography variant="overline" sx={{ letterSpacing: "0.3em" }}>注文 · ORDERS</Typography>
        <Typography variant="h4" sx={{ mt: 1 }}>The ledger is behind the counter.</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Log in to see and track the orders tied to your account.
        </Typography>
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center", mt: 3, flexWrap: "wrap" }}>
          <Button component={RouterLink} to="/login" variant="contained" color="primary">Log in</Button>
          <Button component={RouterLink} to="/register" variant="outlined">Create account</Button>
        </Box>
      </Container>
    );
  }

  return <OrdersList />;
}
