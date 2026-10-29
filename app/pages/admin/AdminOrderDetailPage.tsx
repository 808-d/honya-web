import { useState } from "react";
import { Link as RouterLink, useParams } from "react-router";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AdminPageHeader } from "../../shared/admin/AdminPageHeader";
import { ConfirmDialog } from "../../shared/admin/ConfirmDialog";
import { useAuth } from "../../contexts/AuthContext";
import { useAdminOrder, useUpdateOrderPayment, useUpdateOrderStatus } from "../../hooks";
import { formatDate, formatMoney } from "../../lib/format";
import { ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL, orderStatusLabel, paymentMethodLabel, paymentStatusLabel } from "../../models/order";

const NEXT_STATUS: Record<number, number[]> = {
  0: [1, 5],
  1: [2, 5],
  2: [3, 5],
  3: [4],
  4: [6],
};

const NEXT_PAYMENT: Record<number, number[]> = {
  0: [1, 2],
  2: [1],
  1: [3],
};

const DESTRUCTIVE_STATUS = new Set([5, 6]);

const STATUS_COLOR: Record<number, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
  0: "warning",
  1: "info",
  2: "info",
  3: "primary",
  4: "success",
  5: "error",
  6: "default",
};

const PAYMENT_COLOR: Record<number, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
  0: "warning",
  1: "success",
  2: "error",
  3: "default",
};

interface PendingAction {
  kind: "status" | "payment";
  value: number;
}

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const { hasFeature } = useAuth();
  const canWrite = hasFeature("order.write");

  const order = useAdminOrder(id);
  const updateStatus = useUpdateOrderStatus();
  const updatePayment = useUpdateOrderPayment();
  const [pending, setPending] = useState<PendingAction | null>(null);

  const data = order.data;

  const run = async (action: PendingAction) => {
    if (!id) return;
    try {
      if (action.kind === "status") {
        await updateStatus.mutate({ id, status: action.value });
      } else {
        await updatePayment.mutate({ id, paymentStatus: action.value });
      }
      setPending(null);
      order.refetch();
    } catch {
      setPending(null);
    }
  };

  const act = (action: PendingAction) => {
    const destructive = action.kind === "status" ? DESTRUCTIVE_STATUS.has(action.value) : action.value === 3;
    if (destructive) {
      setPending(action);
      return;
    }
    void run(action);
  };

  if (order.loading) {
    return <Typography variant="body2" color="text.secondary">Loading order…</Typography>;
  }

  if (order.error || !data) {
    return (
      <Box>
        <AdminPageHeader kicker="注文 · ORDERS" title="Order not found" />
        <Typography variant="body2" color="secondary">{order.error}</Typography>
        <Button component={RouterLink} to="/admin/orders" variant="outlined" sx={{ mt: 2 }}>Back to orders</Button>
      </Box>
    );
  }

  const busy = updateStatus.loading || updatePayment.loading;
  const mutationError = updateStatus.error || updatePayment.error;
  const paymentNext = (NEXT_PAYMENT[data.payment_status] ?? []).filter(
    (next) => next !== 3 || data.status === 4,
  );

  return (
    <Box>
      <AdminPageHeader
        kicker="注文 · ORDERS"
        title={`Order ${data.id.slice(0, 8)}`}
        description={`Placed ${formatDate(data.create_time)} · ${paymentMethodLabel(data.payment_method)}`}
        action={<Button component={RouterLink} to="/admin/orders" variant="outlined">Back to orders</Button>}
      />

      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", lg: "1.7fr 1fr" }, alignItems: "start" }}>
        <Box sx={{ display: "grid", gap: 3 }}>
          <Box sx={{ bgcolor: "var(--honya-foam)", border: "1px solid var(--honya-line)", boxShadow: "5px 5px 0 var(--honya-shadow)" }}>
            <Box sx={{ p: 2, borderBottom: "1px solid var(--honya-line)" }}>
              <Typography variant="h6">Items</Typography>
            </Box>
            {(data.items ?? []).map((item, index) => (
              <Box
                key={`${item.product_id ?? item.product_title}-${index}`}
                sx={{ display: "grid", gridTemplateColumns: "44px 1fr auto", gap: 1.5, alignItems: "center", p: 2, borderBottom: index === (data.items?.length ?? 0) - 1 ? 0 : "1px solid var(--honya-line-soft)" }}
              >
                <Box sx={{ width: 40, height: 54, bgcolor: "#0F2847", color: "#F7F2E6", display: "grid", placeItems: "center", overflow: "hidden" }}>
                  {item.product_cover ? (
                    <Box component="img" src={item.product_cover} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <Typography variant="caption">{item.product_title.slice(0, 1)}</Typography>
                  )}
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.product_title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatMoney(item.unit_price)} × {item.quantity}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums" }}>{formatMoney(item.subtotal)}</Typography>
              </Box>
            ))}

            <Box sx={{ p: 2, display: "grid", gap: 0.75 }}>
              <Row label="Subtotal" value={formatMoney(data.subtotal)} />
              {data.discount_amount > 0 && (
                <Row label={data.coupon_code ? `Discount · ${data.coupon_code}` : "Discount"} value={`−${formatMoney(data.discount_amount)}`} />
              )}
              <Row label="Shipping" value={formatMoney(data.shipping_fee)} />
              <Divider sx={{ my: 0.5 }} />
              <Row label="Total" value={formatMoney(data.total)} strong />
            </Box>
          </Box>

          <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
            <Panel title="Ship to">
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{data.shipping_name}</Typography>
              <Typography variant="body2" color="text.secondary">{data.shipping_phone}</Typography>
              <Typography variant="body2" sx={{ mt: 1, whiteSpace: "pre-line" }}>{data.shipping_address}</Typography>
            </Panel>
            <Panel title="Notes">
              <Typography variant="body2" color={data.note ? "text.primary" : "text.secondary"} sx={{ whiteSpace: "pre-line" }}>
                {data.note || "No note from the customer."}
              </Typography>
              {data.coupon_code && (
                <Typography variant="body2" sx={{ mt: 1.5 }}>
                  Coupon: <strong>{data.coupon_code}</strong>
                </Typography>
              )}
            </Panel>
          </Box>
        </Box>

        <Box sx={{ display: "grid", gap: 3 }}>
          <Panel title="Fulfilment">
            <Chip label={orderStatusLabel(data.status)} color={STATUS_COLOR[data.status] ?? "default"} variant="outlined" />
            <Stack spacing={1} sx={{ mt: 2 }}>
              {canWrite ? (
                (NEXT_STATUS[data.status] ?? []).map((next) => (
                  <Button
                    key={next}
                    size="small"
                    variant={next === 5 || next === 6 ? "outlined" : "contained"}
                    color={next === 5 || next === 6 ? "secondary" : "primary"}
                    disabled={busy}
                    onClick={() => act({ kind: "status", value: next })}
                  >
                    {ORDER_STATUS_LABEL[next]}
                  </Button>
                ))
              ) : (
                <Typography variant="caption" color="text.secondary">Read-only — order.write is not granted.</Typography>
              )}
              {(NEXT_STATUS[data.status] ?? []).length === 0 && canWrite && (
                <Typography variant="caption" color="text.secondary">No further fulfilment transitions.</Typography>
              )}
            </Stack>
          </Panel>

          <Panel title="Payment">
            <Chip label={paymentStatusLabel(data.payment_status)} color={PAYMENT_COLOR[data.payment_status] ?? "default"} variant="outlined" />
            {data.paid_at && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                Paid {formatDate(data.paid_at)}
              </Typography>
            )}
            <Stack spacing={1} sx={{ mt: 2 }}>
              {canWrite ? (
                paymentNext.map((next) => (
                  <Button
                    key={next}
                    size="small"
                    variant={next === 3 ? "outlined" : "contained"}
                    color={next === 3 ? "secondary" : "primary"}
                    disabled={busy}
                    onClick={() => act({ kind: "payment", value: next })}
                  >
                    {PAYMENT_STATUS_LABEL[next]}
                  </Button>
                ))
              ) : (
                <Typography variant="caption" color="text.secondary">Read-only — order.write is not granted.</Typography>
              )}
              {paymentNext.length === 0 && canWrite && (
                <Typography variant="caption" color="text.secondary">No further payment transitions.</Typography>
              )}
            </Stack>
          </Panel>

          <Panel title="Record">
            <Row label="Order ID" value={<Box component="span" sx={{ fontFamily: "monospace", fontSize: 12 }}>{data.id}</Box>} />
            <Row label="Created" value={formatDate(data.create_time)} />
            <Row label="Updated" value={formatDate(data.update_time)} />
            <Row label="Method" value={paymentMethodLabel(data.payment_method)} />
          </Panel>

          {mutationError && (
            <Box role="alert" sx={{ p: 1.5, border: "1px solid #B5402A", bgcolor: "rgba(181,64,42,0.06)" }}>
              <Typography variant="body2" color="secondary">{mutationError}</Typography>
            </Box>
          )}
        </Box>
      </Box>

      <ConfirmDialog
        open={Boolean(pending)}
        title={pending?.kind === "payment" ? "Refund this payment?" : pending?.value === 5 ? "Cancel this order?" : "Mark this order refunded?"}
        confirmLabel={pending?.kind === "payment" ? "Refund" : pending?.value === 5 ? "Cancel order" : "Refund order"}
        danger
        loading={busy}
        onClose={() => setPending(null)}
        onConfirm={() => pending && void run(pending)}
      >
        <Typography variant="body2">
          {pending?.kind === "payment"
            ? "The payment will be marked refunded and the order moved to refunded."
            : pending?.value === 5
              ? "Stock will be restored and the order closed. This cannot be undone."
              : "The order will be marked refunded. This cannot be undone."}
        </Typography>
      </ConfirmDialog>
    </Box>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ bgcolor: "var(--honya-foam)", border: "1px solid var(--honya-line)", p: 2 }}>
      <Typography variant="overline" sx={{ letterSpacing: "0.2em", color: "text.secondary" }}>{title}</Typography>
      <Box sx={{ mt: 1 }}>{children}</Box>
    </Box>
  );
}

function Row({ label, value, strong }: { label: string; value: React.ReactNode; strong?: boolean }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: strong ? 700 : 400, textAlign: "right" }}>{value}</Typography>
    </Box>
  );
}
