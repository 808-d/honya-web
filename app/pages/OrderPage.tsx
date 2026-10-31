import { useState } from "react";
import { Link as RouterLink, useParams } from "react-router";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { useAuth } from "../contexts/AuthContext";
import { useCancelOrder, useOrder, useReceiveOrder } from "../hooks";
import { ConfirmDialog } from "../shared/components";
import { formatDate, formatMoney } from "../lib/format";
import {
  ORDER_STATUS_COLOR,
  PAYMENT_STATUS_COLOR,
  canCancelOrder,
  canConfirmReceipt,
  orderStatusLabel,
  paymentMethodLabel,
  paymentStatusLabel,
} from "../models/order";
import type { OrderDto } from "../models/api";

function MoneyRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.75 }}>
      <Typography variant="body2" color={strong ? "text.primary" : "text.secondary"} sx={{ fontWeight: strong ? 700 : 400 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: strong ? 700 : 500 }}>{value}</Typography>
    </Box>
  );
}

type OrderAction = "cancel" | "receive";

function OrderView({ id }: { id: string }) {
  const { data: order, loading, error, refetch } = useOrder(id);
  const cancel = useCancelOrder();
  const receive = useReceiveOrder();
  const [action, setAction] = useState<OrderAction | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const busy = cancel.loading || receive.loading;

  const runAction = async () => {
    if (!action) return;
    setActionError(null);
    setNotice(null);
    try {
      if (action === "cancel") {
        await cancel.mutate(id);
        setNotice("Order cancelled. Stock has been returned to the shelves.");
      } else {
        await receive.mutate(id);
        setNotice("Order marked as received. Enjoy the read.");
      }
      setAction(null);
      refetch();
    } catch (err) {
      setAction(null);
      setActionError(
        err instanceof Error
          ? err.message
          : action === "cancel"
            ? "Could not cancel this order."
            : "Could not confirm this order.",
      );
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="body2" color="text.secondary">Retrieving your order…</Typography>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: "center" }}>
        <Typography variant="h4">Order not found</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {error ?? "This order may belong to another account."}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center", mt: 3, flexWrap: "wrap" }}>
          <Button component={RouterLink} to="/orders" variant="contained" color="primary">My orders</Button>
          <Button component={RouterLink} to="/products" variant="outlined">Browse shelves</Button>
          <Button component={RouterLink} to="/cart" variant="outlined">Open basket</Button>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <OrderDetail
        order={order}
        actionError={actionError}
        notice={notice}
        busy={busy}
        onCancel={() => setAction("cancel")}
        onReceive={() => setAction("receive")}
      />
      <ConfirmDialog
        open={Boolean(action)}
        title={action === "cancel" ? "Cancel this order?" : "Confirm you received this order?"}
        confirmLabel={action === "cancel" ? "Cancel order" : "Confirm received"}
        danger={action === "cancel"}
        loading={busy}
        onClose={() => {
          if (!busy) setAction(null);
        }}
        onConfirm={() => void runAction()}
      >
        <Typography variant="body2">
          {action === "cancel"
            ? "The order will be cancelled, stock returned to the shelves, and any coupon released. This cannot be undone."
            : "Confirm that the parcel arrived safely. The order will be marked completed and the cash-on-delivery payment recorded as paid."}
        </Typography>
      </ConfirmDialog>
    </>
  );
}

function OrderDetail({
  order,
  actionError,
  notice,
  busy,
  onCancel,
  onReceive,
}: {
  order: OrderDto;
  actionError: string | null;
  notice: string | null;
  busy: boolean;
  onCancel: () => void;
  onReceive: () => void;
}) {
  const items = order.items ?? [];
  const cancellable = canCancelOrder(order.status, order.payment_status);
  const receivable = canConfirmReceipt(order.status);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3 } }}>
      <Typography variant="overline" sx={{ letterSpacing: "0.3em" }}>注文 · ORDER</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
        <ReceiptLongIcon sx={{ color: "#C19A5B", fontSize: 30 }} />
        <Typography variant="h3" sx={{ fontSize: { xs: "1.7rem", sm: "2.4rem" } }}>Order details</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        Placed {formatDate(order.create_time)} · Order Nº {order.id}
      </Typography>

      <Box sx={{ display: "flex", gap: 1, mt: 1.5, flexWrap: "wrap" }}>
        <Chip label={orderStatusLabel(order.status)} color={ORDER_STATUS_COLOR[order.status] ?? "default"} variant="outlined" />
        <Chip label={`Payment: ${paymentStatusLabel(order.payment_status)}`} color={PAYMENT_STATUS_COLOR[order.payment_status] ?? "default"} variant="outlined" />
        <Chip label={paymentMethodLabel(order.payment_method)} variant="outlined" />
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
        <Box sx={{ bgcolor: "var(--honya-foam)", border: "1px solid var(--honya-line-strong)", boxShadow: "6px 6px 0 var(--honya-shadow)" }}>
          <Box sx={{ px: { xs: 2, sm: 3 }, py: 2, borderBottom: "1px solid var(--honya-line)" }}>
            <Typography variant="h6">Your volumes</Typography>
            <Typography variant="caption" color="text.secondary">{items.length} {items.length === 1 ? "line" : "lines"}</Typography>
          </Box>
          {items.length === 0 ? (
            <Box sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary">No line items were returned for this order.</Typography>
            </Box>
          ) : (
            items.map((item, index) => (
              <Box key={`${item.product_id ?? item.product_title}-${index}`}>
                {index > 0 && <Divider />}
                <Box sx={{ display: "flex", gap: 2, alignItems: "center", p: { xs: 1.5, sm: 2 } }}>
                  <Box
                    sx={{
                      width: { xs: 48, sm: 60 },
                      height: { xs: 68, sm: 84 },
                      flexShrink: 0,
                      bgcolor: "#0F2847",
                      color: "#F7F2E6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      border: "1px solid var(--honya-line-strong)",
                    }}
                  >
                    {item.product_cover ? (
                      <Box component="img" src={item.product_cover} alt={item.product_title} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <Typography variant="h5" sx={{ fontFamily: '"Shippori Mincho B1", serif', opacity: 0.8 }}>
                        {item.product_title.slice(0, 1)}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="h6" sx={{ fontSize: { xs: "1rem", sm: "1.1rem" }, lineHeight: 1.3 }}>
                      {item.product_title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {formatMoney(item.unit_price)} × {item.quantity}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatMoney(item.subtotal)}</Typography>
                </Box>
              </Box>
            ))
          )}
        </Box>

        <Box sx={{ display: "grid", gap: 2.5 }}>
          <Box sx={{ bgcolor: "var(--honya-foam)", border: "1px solid var(--honya-line-strong)", p: 2.5 }}>
            <Typography variant="overline" sx={{ letterSpacing: "0.2em" }}>会計 · TOTAL</Typography>
            <Box sx={{ mt: 1 }}>
              <MoneyRow label="Subtotal" value={formatMoney(order.subtotal)} />
              {order.discount_amount > 0 && (
                <MoneyRow label="Discount" value={`−${formatMoney(order.discount_amount)}`} />
              )}
              <MoneyRow label="Shipping" value={formatMoney(order.shipping_fee)} />
              <Divider sx={{ my: 1 }} />
              <MoneyRow label="Total" value={formatMoney(order.total)} strong />
            </Box>
            {order.coupon_code && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                Coupon applied: {order.coupon_code}
              </Typography>
            )}
          </Box>

          <Box sx={{ bgcolor: "var(--honya-foam)", border: "1px solid var(--honya-line-strong)", p: 2.5 }}>
            <Typography variant="overline" sx={{ letterSpacing: "0.2em" }}>配送 · DELIVERY</Typography>
            <Box sx={{ mt: 1, display: "grid", gap: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{order.shipping_name}</Typography>
              <Typography variant="body2" color="text.secondary">{order.shipping_phone}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-line" }}>{order.shipping_address}</Typography>
              {order.note && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  Note: {order.note}
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Button component={RouterLink} to="/orders" variant="outlined">
              All orders
            </Button>
            <Button component={RouterLink} to="/products" variant="outlined">
              Keep browsing
            </Button>
            {receivable && (
              <Button variant="contained" color="primary" onClick={onReceive} disabled={busy}>
                {busy ? "Confirming…" : "Confirm received"}
              </Button>
            )}
            {cancellable && (
              <Button variant="outlined" color="secondary" onClick={onCancel} disabled={busy}>
                {busy ? "Cancelling…" : "Cancel order"}
              </Button>
            )}
          </Box>
          {notice && (
            <Box role="status" sx={{ p: 1.5, border: "1px solid #4A5D4E", bgcolor: "rgba(74,93,78,0.1)" }}>
              <Typography variant="body2" color="success.main">{notice}</Typography>
            </Box>
          )}
          {actionError && (
            <Box role="alert" sx={{ p: 1.5, border: "1px solid #B5402A", bgcolor: "rgba(181,64,42,0.06)" }}>
              <Typography variant="body2" color="secondary">{actionError}</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
}

export default function OrderPage() {
  const { id } = useParams();
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
        <Typography variant="overline" sx={{ letterSpacing: "0.3em" }}>注文 · ORDER</Typography>
        <Typography variant="h4" sx={{ mt: 1 }}>This order is behind the counter.</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Log in to view the order tied to your account.
        </Typography>
        <Button component={RouterLink} to="/login" variant="contained" color="primary" sx={{ mt: 3 }}>
          Log in
        </Button>
      </Container>
    );
  }

  return <OrderView id={id ?? ""} />;
}
