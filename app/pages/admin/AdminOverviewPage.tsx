import { Link as RouterLink } from "react-router";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { AdminPageHeader } from "../../shared/admin/AdminPageHeader";
import { AdminTable } from "../../shared/admin/AdminTable";
import { useAuth } from "../../contexts/AuthContext";
import { useAdminOrders, useAdminStats } from "../../hooks";
import { formatDate, formatMoney } from "../../lib/format";
import { orderStatusLabel } from "../../models/order";
import type { OrderDto } from "../../models/api";

const STATUS_COLOR: Record<number, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
  0: "warning",
  1: "info",
  2: "info",
  3: "primary",
  4: "success",
  5: "error",
  6: "default",
};

function StatCard({ label, value, hint, to }: { label: string; value: string | number; hint?: string; to?: string }) {
  const body = (
    <Box
      sx={{
        height: "100%",
        bgcolor: "var(--honya-foam)",
        border: "1px solid var(--honya-line)",
        p: 2.25,
        boxShadow: "5px 5px 0 var(--honya-shadow)",
        transition: "transform 120ms ease",
        "&:hover": to ? { transform: "translate(-1px, -1px)" } : undefined,
      }}
    >
      <Typography variant="overline" sx={{ letterSpacing: "0.2em", color: "text.secondary" }}>{label}</Typography>
      <Typography variant="h4" sx={{ mt: 0.5, fontVariantNumeric: "tabular-nums" }}>{value}</Typography>
      {hint && <Typography variant="caption" color="text.secondary">{hint}</Typography>}
    </Box>
  );

  if (to) {
    return <Box component={RouterLink} to={to} sx={{ textDecoration: "none", color: "inherit" }}>{body}</Box>;
  }
  return body;
}

function RecentOrders() {
  const orders = useAdminOrders({ perPage: 5 });

  const columns = [
    {
      key: "id",
      label: "Order",
      render: (order: OrderDto) => (
        <Box component={RouterLink} to={`/admin/orders/${order.id}`} sx={{ fontWeight: 600, fontFamily: "monospace", fontSize: 12 }}>
          {order.id.slice(0, 8)}
        </Box>
      ),
    },
    { key: "customer", label: "Customer", render: (order: OrderDto) => order.shipping_name },
    { key: "total", label: "Total", align: "right" as const, render: (order: OrderDto) => formatMoney(order.total) },
    {
      key: "status",
      label: "Status",
      render: (order: OrderDto) => <Chip size="small" label={orderStatusLabel(order.status)} color={STATUS_COLOR[order.status] ?? "default"} variant="outlined" />,
    },
    { key: "placed", label: "Placed", render: (order: OrderDto) => formatDate(order.create_time) },
  ];

  return (
    <AdminTable
      columns={columns}
      rows={orders.data?.items ?? []}
      getKey={(order) => order.id}
      loading={orders.loading}
      error={orders.error}
      empty="No orders have come through yet."
    />
  );
}

export default function AdminOverviewPage() {
  const stats = useAdminStats();
  const { hasFeature, roles } = useAuth();

  if (stats.error) {
    return (
      <Box>
        <AdminPageHeader kicker="概要 · OVERVIEW" title="Dashboard" />
        <Box role="alert" sx={{ p: 2, border: "1px solid #B5402A", bgcolor: "rgba(181,64,42,0.06)" }}>
          <Typography variant="body2" color="secondary">{stats.error}</Typography>
        </Box>
      </Box>
    );
  }

  const data = stats.data;
  const orderData = data?.orders;

  return (
    <Box>
      <AdminPageHeader
        kicker="概要 · OVERVIEW"
        title="The back counter"
        description={roles.length ? `Signed in with ${roles.join(", ")}. Values update as the shop moves.` : undefined}
      />

      {stats.loading && !data ? (
        <Typography variant="body2" color="text.secondary">Taking stock…</Typography>
      ) : (
        <>
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" } }}>
            <StatCard label="Products" value={data?.products.total ?? 0} hint={`${data?.products.active ?? 0} active · ${data?.products.low_stock ?? 0} low stock`} to="/admin/products" />
            <StatCard label="Orders" value={orderData?.total ?? 0} hint={`${orderData?.pending ?? 0} pending · ${orderData?.shipping ?? 0} shipping`} to={hasFeature("order.read") ? "/admin/orders" : undefined} />
            <StatCard label="Paid revenue" value={formatMoney(orderData?.paid_revenue ?? 0)} hint="Orders marked paid" />
            <StatCard label="Customers" value={data?.users.total ?? 0} hint={`${data?.coupons.active ?? 0} active coupons`} />
          </Box>

          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, mt: 2 }}>
            <Box sx={{ bgcolor: "#0F2847", color: "#F7F2E6", p: 2.25 }}>
              <Typography variant="overline" sx={{ letterSpacing: "0.2em", opacity: 0.7 }}>IDEAS AT THE COUNTER</Typography>
              <Typography variant="h6" sx={{ color: "#F7F2E6", mt: 0.5 }}>
                {data?.products.low_stock ?? 0} {(data?.products.low_stock ?? 0) === 1 ? "volume" : "volumes"} low on stock
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.75, mt: 0.5 }}>
                Restock before the shelf looks bare.
              </Typography>
              <Button component={RouterLink} to="/admin/products" size="small" variant="outlined" sx={{ mt: 1.5, color: "#F7F2E6", borderColor: "rgba(247,242,230,0.4)" }}>
                Review products
              </Button>
            </Box>
            <Box sx={{ bgcolor: "var(--honya-foam)", border: "1px solid var(--honya-line)", p: 2.25 }}>
              <Typography variant="overline" sx={{ letterSpacing: "0.2em", color: "text.secondary" }}>FULFILMENT</Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mt: 1 }}>
                {[
                  ["Pending", orderData?.pending ?? 0],
                  ["Confirmed", orderData?.confirmed ?? 0],
                  ["Processing", orderData?.processing ?? 0],
                  ["Shipping", orderData?.shipping ?? 0],
                  ["Completed", orderData?.completed ?? 0],
                  ["Cancelled", orderData?.cancelled ?? 0],
                ].map(([label, value]) => (
                  <Box key={String(label)} sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{value}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
            <Box sx={{ bgcolor: "var(--honya-foam)", border: "1px solid var(--honya-line)", p: 2.25 }}>
              <Typography variant="overline" sx={{ letterSpacing: "0.2em", color: "text.secondary" }}>CATALOG</Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mt: 1 }}>
                {[
                  ["Total", data?.products.total ?? 0],
                  ["Active", data?.products.active ?? 0],
                  ["Draft", data?.products.draft ?? 0],
                  ["Archived", data?.products.archived ?? 0],
                ].map(([label, value]) => (
                  <Box key={String(label)} sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{value}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {hasFeature("order.read") && (
            <>
              <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 2, mt: 4, mb: 1.5 }}>
                <Typography variant="h5">Recent orders</Typography>
                <Button component={RouterLink} to="/admin/orders" size="small">View all →</Button>
              </Box>
              <RecentOrders />
            </>
          )}
        </>
      )}
    </Box>
  );
}
