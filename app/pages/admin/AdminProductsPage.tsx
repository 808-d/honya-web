import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
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
import { ConfirmDialog } from "../../shared/admin/ConfirmDialog";
import { useAuth } from "../../contexts/AuthContext";
import { useAdminProducts, useDeleteProduct } from "../../hooks";
import { useRelations } from "../../hooks";
import { formatMoney } from "../../lib/format";
import { PRODUCT_STATUS_LABEL, PRODUCT_TYPE_LABEL } from "../../models/admin";
import type { ProductDto } from "../../models/api";

const STATUS_COLOR: Record<number, "default" | "success" | "warning" | "error" | "info"> = {
  0: "default",
  1: "success",
  2: "warning",
};

export default function AdminProductsPage() {
  const nav = useNavigate();
  const { hasFeature } = useAuth();
  const canWrite = hasFeature("catalog.write");
  const { relations } = useRelations();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [pendingDelete, setPendingDelete] = useState<ProductDto | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const products = useAdminProducts({
    search: search || undefined,
    status: status === "" ? undefined : Number(status),
    type: type === "" ? undefined : Number(type),
    page: page + 1,
    perPage,
  });
  const deleteProduct = useDeleteProduct();

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteProduct.mutate(pendingDelete.id);
      setPendingDelete(null);
      products.refetch();
    } catch {
      /* surfaced by deleteProduct.error */
    }
  };

  const columns: Array<AdminColumn<ProductDto>> = [
    {
      key: "cover",
      label: "",
      width: 52,
      render: (product) => (
        <Box sx={{ width: 34, height: 46, bgcolor: "#0F2847", color: "#F7F2E6", display: "grid", placeItems: "center", overflow: "hidden", border: "1px solid var(--honya-line)" }}>
          {product.cover ? (
            <Box component="img" src={product.cover} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <Typography variant="caption">{product.title.slice(0, 1)}</Typography>
          )}
        </Box>
      ),
    },
    {
      key: "title",
      label: "Title",
      render: (product) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{product.title}</Typography>
          <Typography variant="caption" color="text.secondary">
            {product.publisher_id ? relations.publishers.get(product.publisher_id) ?? "Unknown publisher" : "No publisher"}
          </Typography>
        </Box>
      ),
    },
    { key: "type", label: "Type", render: (product) => PRODUCT_TYPE_LABEL[product.type] ?? "Unknown" },
    { key: "price", label: "Price", align: "right", render: (product) => formatMoney(product.price) },
    {
      key: "stock",
      label: "Stock",
      align: "right",
      render: (product) => (
        <Typography variant="body2" sx={{ fontWeight: product.stock <= 5 ? 700 : 400, color: product.stock <= 5 ? "secondary.main" : "text.primary" }}>
          {product.stock}
        </Typography>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (product) => (
        <Chip size="small" variant="outlined" label={PRODUCT_STATUS_LABEL[product.status] ?? "Unknown"} color={STATUS_COLOR[product.status] ?? "default"} />
      ),
    },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (product) => (
        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
          <IconButton size="small" aria-label={`Edit ${product.title}`} onClick={() => nav(`/admin/products/${product.id}`)} disabled={!canWrite}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" aria-label={`Delete ${product.title}`} onClick={() => setPendingDelete(product)} disabled={!canWrite}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <AdminPageHeader
        kicker="目録 · CATALOG"
        title="Products"
        description="Everything on the shelves, including drafts and archived volumes."
        action={canWrite ? (
          <Button component={RouterLink} to="/admin/products/new" variant="contained" color="primary" startIcon={<AddIcon />}>
            New product
          </Button>
        ) : undefined}
      />

      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center", mb: 2 }}>
        <TextField label="Search title" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} sx={{ minWidth: 220 }} />
        <TextField select label="Status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }} sx={{ minWidth: 140 }}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="0">Draft</MenuItem>
          <MenuItem value="1">Active</MenuItem>
          <MenuItem value="2">Archived</MenuItem>
        </TextField>
        <TextField select label="Type" value={type} onChange={(event) => { setType(event.target.value); setPage(0); }} sx={{ minWidth: 150 }}>
          <MenuItem value="">All</MenuItem>
          {Object.entries(PRODUCT_TYPE_LABEL).map(([value, label]) => (
            <MenuItem key={value} value={value}>{label}</MenuItem>
          ))}
        </TextField>
        <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
          {products.data?.total ?? 0} total
        </Typography>
      </Box>

      <AdminTable
        columns={columns}
        rows={products.data?.items ?? []}
        getKey={(product) => product.id}
        loading={products.loading}
        error={products.error}
        empty="No products match those filters."
      />

      {deleteProduct.error && (
        <Box role="alert" sx={{ mt: 2, p: 1.5, border: "1px solid #B5402A", bgcolor: "rgba(181,64,42,0.06)" }}>
          <Typography variant="body2" color="secondary">{deleteProduct.error}</Typography>
        </Box>
      )}

      <TablePagination
        component="div"
        count={products.data?.total ?? 0}
        page={page}
        onPageChange={(_, next) => setPage(next)}
        rowsPerPage={perPage}
        onRowsPerPageChange={(event) => { setPerPage(Number(event.target.value)); setPage(0); }}
        rowsPerPageOptions={[10, 20, 50]}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete product?"
        confirmLabel="Delete"
        danger
        loading={deleteProduct.loading}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      >
        <Typography variant="body2">
          “{pendingDelete?.title}” will be soft-deleted and hidden from the catalog.
        </Typography>
      </ConfirmDialog>
    </Box>
  );
}
