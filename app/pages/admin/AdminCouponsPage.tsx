import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import TablePagination from "@mui/material/TablePagination";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import { AdminPageHeader } from "../../shared/admin/AdminPageHeader";
import { AdminTable, type AdminColumn } from "../../shared/admin/AdminTable";
import { ConfirmDialog } from "../../shared/components";
import { useAuth } from "../../contexts/AuthContext";
import { useAdminCoupons, useCreateCoupon, useDeleteCoupon, useUpdateCoupon } from "../../hooks";
import { formatDate, formatMoney } from "../../lib/format";
import { COUPON_TYPE_LABEL } from "../../models/admin";
import type { CouponDto, CouponInput } from "../../models/admin";

interface CouponForm {
  code: string;
  type: string;
  value: string;
  min_order_amount: string;
  max_discount: string;
  start_at: string;
  expire_at: string;
  usage_limit: string;
  per_user_limit: string;
  is_active: boolean;
}

const EMPTY_FORM: CouponForm = {
  code: "",
  type: "0",
  value: "0",
  min_order_amount: "0",
  max_discount: "",
  start_at: "",
  expire_at: "",
  usage_limit: "",
  per_user_limit: "1",
  is_active: true,
};

function toForm(coupon: CouponDto): CouponForm {
  return {
    code: coupon.code,
    type: String(coupon.type),
    value: String(coupon.value),
    min_order_amount: String(coupon.min_order_amount),
    max_discount: coupon.max_discount != null ? String(coupon.max_discount) : "",
    start_at: coupon.start_at ? coupon.start_at.slice(0, 10) : "",
    expire_at: coupon.expire_at ? coupon.expire_at.slice(0, 10) : "",
    usage_limit: coupon.usage_limit != null ? String(coupon.usage_limit) : "",
    per_user_limit: String(coupon.per_user_limit),
    is_active: coupon.is_active,
  };
}

function toInput(form: CouponForm): CouponInput {
  return {
    code: form.code.trim(),
    type: Number(form.type),
    value: Number(form.value) || 0,
    min_order_amount: Number(form.min_order_amount) || 0,
    max_discount: Number(form.type) === 1 && form.max_discount !== "" ? Number(form.max_discount) : null,
    start_at: form.start_at ? new Date(`${form.start_at}T00:00:00Z`).toISOString() : null,
    expire_at: form.expire_at ? new Date(`${form.expire_at}T23:59:59Z`).toISOString() : null,
    usage_limit: form.usage_limit !== "" ? Number(form.usage_limit) : null,
    per_user_limit: Number(form.per_user_limit) || 1,
    is_active: form.is_active,
  };
}

function couponValue(coupon: CouponDto): string {
  return coupon.type === 1 ? `${coupon.value}%` : formatMoney(coupon.value);
}

export default function AdminCouponsPage() {
  const { hasFeature } = useAuth();
  const canWrite = hasFeature("coupon.write");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("");
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(20);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const coupons = useAdminCoupons({
    search: search || undefined,
    active: active === "" ? undefined : active === "true",
    page: page + 1,
    perPage,
  });
  const create = useCreateCoupon();
  const update = useUpdateCoupon();
  const remove = useDeleteCoupon();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CouponDto | null>(null);
  const [form, setForm] = useState<CouponForm>(EMPTY_FORM);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CouponDto | null>(null);

  const set = <K extends keyof CouponForm>(key: K, value: CouponForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogError(null);
    setDialogOpen(true);
  };

  const openEdit = (coupon: CouponDto) => {
    setEditing(coupon);
    setForm(toForm(coupon));
    setDialogError(null);
    setDialogOpen(true);
  };

  const save = async () => {
    setDialogError(null);
    try {
      if (editing) {
        await update.mutate({ id: editing.id, input: toInput(form) });
      } else {
        await create.mutate(toInput(form));
      }
      setDialogOpen(false);
      coupons.refetch();
    } catch (err) {
      setDialogError(err instanceof Error ? err.message : "Could not save this coupon.");
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await remove.mutate(pendingDelete.id);
      setPendingDelete(null);
      coupons.refetch();
    } catch {
      /* surfaced by remove.error */
    }
  };

  const columns: Array<AdminColumn<CouponDto>> = [
    {
      key: "code",
      label: "Code",
      render: (coupon) => <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 700 }}>{coupon.code}</Typography>,
    },
    { key: "type", label: "Type", render: (coupon) => COUPON_TYPE_LABEL[coupon.type] ?? "Unknown" },
    { key: "value", label: "Value", align: "right", render: (coupon) => couponValue(coupon) },
    { key: "min", label: "Min. order", align: "right", render: (coupon) => formatMoney(coupon.min_order_amount) },
    {
      key: "usage",
      label: "Used",
      align: "right",
      render: (coupon) => `${coupon.used_count}${coupon.usage_limit != null ? ` / ${coupon.usage_limit}` : ""}`,
    },
    {
      key: "window",
      label: "Window",
      render: (coupon) => (
        <Typography variant="caption" color="text.secondary">
          {coupon.start_at ? formatDate(coupon.start_at) : "Any time"}
          {" → "}
          {coupon.expire_at ? formatDate(coupon.expire_at) : "No expiry"}
        </Typography>
      ),
    },
    {
      key: "active",
      label: "Status",
      render: (coupon) => (
        <Chip size="small" variant="outlined" label={coupon.is_active ? "Active" : "Inactive"} color={coupon.is_active ? "success" : "default"} />
      ),
    },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (coupon) => (
        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
          <IconButton size="small" aria-label={`Edit ${coupon.code}`} onClick={() => openEdit(coupon)} disabled={!canWrite}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" aria-label={`Delete ${coupon.code}`} onClick={() => setPendingDelete(coupon)} disabled={!canWrite}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <AdminPageHeader
        kicker="割引 · COUPONS"
        title="Coupons"
        description="Discount codes, their windows, and how often they have been clipped."
        action={canWrite ? (
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={openCreate}>New coupon</Button>
        ) : undefined}
      />

      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center", mb: 2 }}>
        <TextField label="Search code" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} sx={{ minWidth: 200 }} />
        <TextField select label="Status" value={active} onChange={(event) => { setActive(event.target.value); setPage(0); }} sx={{ minWidth: 130 }}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="true">Active</MenuItem>
          <MenuItem value="false">Inactive</MenuItem>
        </TextField>
        <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>{coupons.data?.total ?? 0} coupons</Typography>
      </Box>

      <AdminTable
        columns={columns}
        rows={coupons.data?.items ?? []}
        getKey={(coupon) => coupon.id}
        loading={coupons.loading}
        error={coupons.error}
        empty="No coupons match those filters."
      />

      <TablePagination
        component="div"
        count={coupons.data?.total ?? 0}
        page={page}
        onPageChange={(_, next) => setPage(next)}
        rowsPerPage={perPage}
        onRowsPerPageChange={(event) => { setPerPage(Number(event.target.value)); setPage(0); }}
        rowsPerPageOptions={[10, 20, 50]}
      />

      <Dialog open={dialogOpen} onClose={create.loading || update.loading ? undefined : () => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? `Edit ${editing.code}` : "New coupon"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, mt: 1 }}>
            <TextField label="Code" required value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())} sx={{ gridColumn: { sm: "1 / -1" } }} />
            <TextField label="Type" select value={form.type} onChange={(e) => set("type", e.target.value)}>
              <MenuItem value="0">Fixed amount</MenuItem>
              <MenuItem value="1">Percent</MenuItem>
            </TextField>
            <TextField label={form.type === "1" ? "Percent off" : "Amount off"} type="number" slotProps={{ htmlInput: { min: 0, step: "0.01" } }} value={form.value} onChange={(e) => set("value", e.target.value)} />
            <TextField label="Minimum order" type="number" slotProps={{ htmlInput: { min: 0, step: "0.01" } }} value={form.min_order_amount} onChange={(e) => set("min_order_amount", e.target.value)} />
            <TextField label="Max discount" type="number" slotProps={{ htmlInput: { min: 0, step: "0.01" } }} value={form.max_discount} onChange={(e) => set("max_discount", e.target.value)} disabled={form.type !== "1"} placeholder="Optional cap" />
            <TextField label="Starts" type="date" slotProps={{ inputLabel: { shrink: true } }} value={form.start_at} onChange={(e) => set("start_at", e.target.value)} />
            <TextField label="Expires" type="date" slotProps={{ inputLabel: { shrink: true } }} value={form.expire_at} onChange={(e) => set("expire_at", e.target.value)} />
            <TextField label="Total usage limit" type="number" slotProps={{ htmlInput: { min: 1 } }} value={form.usage_limit} onChange={(e) => set("usage_limit", e.target.value)} placeholder="Unlimited" />
            <TextField label="Per customer" type="number" slotProps={{ htmlInput: { min: 1 } }} value={form.per_user_limit} onChange={(e) => set("per_user_limit", e.target.value)} />
            <FormControlLabel
              control={<Checkbox checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} />}
              label="Active"
              sx={{ gridColumn: { sm: "1 / -1" } }}
            />
          </Box>
          {dialogError && (
            <Box role="alert" sx={{ mt: 2, p: 1.5, border: "1px solid #B5402A", bgcolor: "rgba(181,64,42,0.06)" }}>
              <Typography variant="body2" color="secondary">{dialogError}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={create.loading || update.loading}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={create.loading || update.loading}>
            {create.loading || update.loading ? "Saving…" : "Save coupon"}
          </Button>
        </DialogActions>
      </Dialog>

      {remove.error && (
        <Box role="alert" sx={{ mt: 2, p: 1.5, border: "1px solid #B5402A", bgcolor: "rgba(181,64,42,0.06)" }}>
          <Typography variant="body2" color="secondary">{remove.error}</Typography>
        </Box>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete coupon?"
        confirmLabel="Delete"
        danger
        loading={remove.loading}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      >
        <Typography variant="body2">“{pendingDelete?.code}” will be removed. Existing orders keep their discount.</Typography>
      </ConfirmDialog>
    </Box>
  );
}
