import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import { AdminPageHeader } from "../../shared/admin/AdminPageHeader";
import { AdminTable, type AdminColumn } from "../../shared/admin/AdminTable";
import { ConfirmDialog } from "../../shared/components";
import { useAuth } from "../../contexts/AuthContext";
import {
  useCreateName,
  useDeleteName,
  useNameList,
  useUpdateName,
  type NameResource,
} from "../../hooks/use-admin-catalog";
import { formatDate } from "../../lib/format";
import type { NameDto } from "../../models/api";

const COPY: Record<NameResource, { kicker: string; title: string; description: string; empty: string }> = {
  authors: {
    kicker: "著者 · AUTHORS",
    title: "Authors",
    description: "The names printed on the spines.",
    empty: "No authors recorded yet.",
  },
  genres: {
    kicker: "分類 · GENRES",
    title: "Genres",
    description: "Shelves within shelves — the broad category a volume belongs to.",
    empty: "No genres recorded yet.",
  },
  publishers: {
    kicker: "版元 · PUBLISHERS",
    title: "Publishers",
    description: "The houses that put the volumes into the world.",
    empty: "No publishers recorded yet.",
  },
  tags: {
    kicker: "付箋 · TAGS",
    title: "Tags",
    description: "Loose labels for browsing across genres.",
    empty: "No tags recorded yet.",
  },
};

export default function AdminNamesPage({ resource }: { resource: NameResource }) {
  const copy = COPY[resource];
  const { hasFeature } = useAuth();
  const canWrite = hasFeature("catalog.write");

  const list = useNameList(resource);
  const create = useCreateName(resource);
  const update = useUpdateName(resource);
  const remove = useDeleteName(resource);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<NameDto | null>(null);
  const [name, setName] = useState("");
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<NameDto | null>(null);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDialogError(null);
    setDialogOpen(true);
  };

  const openEdit = (row: NameDto) => {
    setEditing(row);
    setName(row.name);
    setDialogError(null);
    setDialogOpen(true);
  };

  const save = async () => {
    const value = name.trim();
    if (!value) {
      setDialogError("Name is required.");
      return;
    }
    setDialogError(null);
    try {
      if (editing) {
        await update.mutate({ id: editing.id, name: value });
      } else {
        await create.mutate({ name: value });
      }
      setDialogOpen(false);
      list.refetch();
    } catch (err) {
      setDialogError(err instanceof Error ? err.message : "Could not save this record.");
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await remove.mutate(pendingDelete.id);
      setPendingDelete(null);
      list.refetch();
    } catch {
      /* surfaced by remove.error */
    }
  };

  const columns: Array<AdminColumn<NameDto>> = [
    {
      key: "name",
      label: "Name",
      render: (row) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.name}</Typography>,
    },
    { key: "created", label: "Added", render: (row) => formatDate(row.create_time) },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (row) => (
        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
          <IconButton size="small" aria-label={`Edit ${row.name}`} onClick={() => openEdit(row)} disabled={!canWrite}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" aria-label={`Delete ${row.name}`} onClick={() => setPendingDelete(row)} disabled={!canWrite}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <AdminPageHeader
        kicker={copy.kicker}
        title={copy.title}
        description={copy.description}
        action={canWrite ? (
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={openCreate}>
            New {copy.title.slice(0, -1).toLowerCase()}
          </Button>
        ) : undefined}
      />

      <AdminTable
        columns={columns}
        rows={list.data?.items ?? []}
        getKey={(row) => row.id}
        loading={list.loading}
        error={list.error}
        empty={copy.empty}
      />

      {remove.error && (
        <Box role="alert" sx={{ mt: 2, p: 1.5, border: "1px solid #B5402A", bgcolor: "rgba(181,64,42,0.06)" }}>
          <Typography variant="body2" color="secondary">{remove.error}</Typography>
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={create.loading || update.loading ? undefined : () => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editing ? `Edit ${copy.title.slice(0, -1).toLowerCase()}` : `New ${copy.title.slice(0, -1).toLowerCase()}`}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") void save(); }}
            sx={{ mt: 1 }}
          />
          {dialogError && (
            <Typography variant="body2" color="secondary" sx={{ mt: 1.5 }}>{dialogError}</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={create.loading || update.loading}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={create.loading || update.loading}>
            {create.loading || update.loading ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete ${copy.title.slice(0, -1).toLowerCase()}?`}
        confirmLabel="Delete"
        danger
        loading={remove.loading}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      >
        <Typography variant="body2">“{pendingDelete?.name}” will be removed from the catalog.</Typography>
      </ConfirmDialog>
    </Box>
  );
}
