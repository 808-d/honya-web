import { useState } from "react";
import { Link as RouterLink } from "react-router";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import TablePagination from "@mui/material/TablePagination";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { AdminPageHeader } from "../../shared/admin/AdminPageHeader";
import { AdminTable, type AdminColumn } from "../../shared/admin/AdminTable";
import { useAdminOrders } from "../../hooks";
import { formatDate, formatMoney } from "../../lib/format";
import { ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL, orderStatusLabel, paymentStatusLabel } from "../../models/order";
import type { OrderDto } from "../../models/api";

const ORDER_COLOR: Record<number, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
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

export default function AdminOrdersPage() {
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(20);

  const orders = useAdminOrders({
    status: status === "" ? undefined : Number(status),
    paymentStatus: paymentStatus === "" ? undefined : Number(paymentStatus),
    page: page + 1,
    perPage,
  });

  const columns: Array<AdminColumn<OrderDto>> = [
    {
      key: "id",
      label: "Order",
      render: (order) => (
        <Box component={RouterLink} to={`/admin/orders/${order.id}`} sx={{ fontFamily: "monospace", fontSize: 12, fontWeight: 600 }}>
          {order.id.slice(0, 8)}
        </Box>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (order) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{order.shipping_name}</Typography>
          <Typography variant="caption" color="text.secondary">{order.shipping_phone}</Typography>
        </Box>
      ),
    },
    { key: "total", label: "Total", align: "right", render: (order) => formatMoney(order.total) },
    {
      key: "payment",
      label: "Payment",
      render: (order) => (
        <Chip size="small" variant="outlined" label={paymentStatusLabel(order.payment_status)} color={PAYMENT_COLOR[order.payment_status] ?? "default"} />
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (order) => (
        <Chip size="small" variant="outlined" label={orderStatusLabel(order.status)} color={ORDER_COLOR[order.status] ?? "default"} />
      ),
    },
    { key: "placed", label: "Placed", render: (order) => formatDate(order.create_time) },
  ];

  return (
    <Box>
      <AdminPageHeader
        kicker="注文 · ORDERS"
        title="Orders"
        description="Every order that has crossed the counter, newest first."
      />

      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center", mb: 2 }}>
        <TextField select label="Fulfilment" value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }} sx={{ minWidth: 160 }}>
          <MenuItem value="">All</MenuItem>
          {Object.entries(ORDER_STATUS_LABEL).map(([value, label]) => (
            <MenuItem key={value} value={value}>{label}</MenuItem>
          ))}
        </TextField>
        <TextField select label="Payment" value={paymentStatus} onChange={(event) => { setPaymentStatus(event.target.value); setPage(0); }} sx={{ minWidth: 150 }}>
          <MenuItem value="">All</MenuItem>
          {Object.entries(PAYMENT_STATUS_LABEL).map(([value, label]) => (
            <MenuItem key={value} value={value}>{label}</MenuItem>
          ))}
        </TextField>
        <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
          {orders.data?.total ?? 0} orders
        </Typography>
      </Box>

      <AdminTable
        columns={columns}
        rows={orders.data?.items ?? []}
        getKey={(order) => order.id}
        loading={orders.loading}
        error={orders.error}
        empty="No orders match those filters."
      />

      <TablePagination
        component="div"
        count={orders.data?.total ?? 0}
        page={page}
        onPageChange={(_, next) => setPage(next)}
        rowsPerPage={perPage}
        onRowsPerPageChange={(event) => { setPerPage(Number(event.target.value)); setPage(0); }}
        rowsPerPageOptions={[10, 20, 50]}
      />
    </Box>
  );
}
