import { useState } from "react";
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
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import { AdminPageHeader } from "../../shared/admin/AdminPageHeader";
import { AdminTable, type AdminColumn } from "../../shared/admin/AdminTable";
import { ConfirmDialog } from "../../shared/components";
import { useAuth } from "../../contexts/AuthContext";
import { useCreateRole, useDeleteRole, useFeatures, useRoles, useUpdateRole } from "../../hooks";
import { featureGroup } from "../../models/admin";
import type { FeatureDto, RoleDto } from "../../models/admin";

interface RoleForm {
  name: string;
  description: string;
  featureIds: string[];
}

const EMPTY: RoleForm = { name: "", description: "", featureIds: [] };

function groupFeatures(features: FeatureDto[]): Array<{ group: string; items: FeatureDto[] }> {
  const buckets = new Map<string, FeatureDto[]>();
  for (const feature of features) {
    const group = featureGroup(feature.code);
    buckets.set(group, [...(buckets.get(group) ?? []), feature]);
  }
  return [...buckets.entries()]
    .map(([group, items]) => ({ group, items: items.sort((a, b) => a.code.localeCompare(b.code)) }))
    .sort((a, b) => a.group.localeCompare(b.group));
}

export default function AdminRolesPage() {
  const { hasFeature } = useAuth();
  const canWrite = hasFeature("role.write");

  const roles = useRoles();
  const features = useFeatures();
  const create = useCreateRole();
  const update = useUpdateRole();
  const remove = useDeleteRole();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RoleDto | null>(null);
  const [form, setForm] = useState<RoleForm>(EMPTY);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<RoleDto | null>(null);

  const featureCodeById = new Map((features.data ?? []).map((feature) => [feature.id, feature.code]));
  const isAdminRole = editing?.name === "admin";

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setDialogError(null);
    setDialogOpen(true);
  };

  const openEdit = (role: RoleDto) => {
    const ids = (features.data ?? [])
      .filter((feature) => role.features.includes(feature.code))
      .map((feature) => feature.id);
    setEditing(role);
    setForm({ name: role.name, description: role.description, featureIds: ids });
    setDialogError(null);
    setDialogOpen(true);
  };

  const toggleFeature = (id: string) => {
    setForm((prev) => ({
      ...prev,
      featureIds: prev.featureIds.includes(id)
        ? prev.featureIds.filter((value) => value !== id)
        : [...prev.featureIds, id],
    }));
  };

  const save = async () => {
    setDialogError(null);
    try {
      const input = { name: form.name.trim(), description: form.description.trim(), feature_ids: form.featureIds };
      if (editing) {
        await update.mutate({ id: editing.id, input });
      } else {
        await create.mutate(input);
      }
      setDialogOpen(false);
      roles.refetch();
    } catch (err) {
      setDialogError(err instanceof Error ? err.message : "Could not save this role.");
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await remove.mutate(pendingDelete.id);
      setPendingDelete(null);
      roles.refetch();
    } catch {
      /* surfaced by remove.error */
    }
  };

  const columns: Array<AdminColumn<RoleDto>> = [
    {
      key: "name",
      label: "Role",
      render: (role) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{role.name}</Typography>
          <Typography variant="caption" color="text.secondary">{role.description || "No description"}</Typography>
        </Box>
      ),
    },
    {
      key: "features",
      label: "Features",
      render: (role) => (
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          {role.features.length === 0 ? (
            <Typography variant="caption" color="text.secondary">None</Typography>
          ) : (
            role.features.slice(0, 4).map((code) => (
              <Chip key={code} size="small" label={code} variant="outlined" sx={{ height: 20, fontSize: 10 }} />
            ))
          )}
          {role.features.length > 4 && (
            <Chip size="small" label={`+${role.features.length - 4}`} variant="outlined" sx={{ height: 20, fontSize: 10 }} />
          )}
        </Box>
      ),
    },
    { key: "members", label: "Members", align: "right", render: (role) => role.member_count },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (role) => (
        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
          <IconButton size="small" aria-label={`Edit ${role.name}`} onClick={() => openEdit(role)} disabled={!canWrite}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" aria-label={`Delete ${role.name}`} onClick={() => setPendingDelete(role)} disabled={!canWrite || role.name === "admin"}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <AdminPageHeader
        kicker="権限 · ROLES"
        title="Roles"
        description="Roles are labels. What a person can actually do is decided by the features you pin to their role."
        action={canWrite ? (
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={openCreate}>New role</Button>
        ) : undefined}
      />

      <AdminTable
        columns={columns}
        rows={roles.data ?? []}
        getKey={(role) => role.id}
        loading={roles.loading}
        error={roles.error || features.error}
        empty="No roles have been created yet."
      />

      {remove.error && (
        <Box role="alert" sx={{ mt: 2, p: 1.5, border: "1px solid #B5402A", bgcolor: "rgba(181,64,42,0.06)" }}>
          <Typography variant="body2" color="secondary">{remove.error}</Typography>
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={create.loading || update.loading ? undefined : () => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? `Edit ${editing.name}` : "New role"}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gap: 2, mt: 0.5 }}>
            <TextField
              label="Name"
              required
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              disabled={isAdminRole}
              helperText={isAdminRole ? "The admin role cannot be renamed." : "Free-form — use whatever your team calls it."}
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              multiline
              minRows={2}
            />
          </Box>

          <Typography variant="overline" sx={{ display: "block", letterSpacing: "0.2em", color: "text.secondary", mt: 3 }}>
            Features
          </Typography>
          {features.loading && <Typography variant="caption" color="text.secondary">Loading features…</Typography>}
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, mt: 1 }}>
            {groupFeatures(features.data ?? []).map((section) => (
              <Box key={section.group} sx={{ border: "1px solid var(--honya-line)", p: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  {section.group}
                </Typography>
                <Box sx={{ display: "grid", mt: 0.5 }}>
                  {section.items.map((feature) => {
                    const locked = isAdminRole && feature.code === "dashboard.access";
                    return (
                      <FormControlLabel
                        key={feature.id}
                        control={(
                          <Checkbox
                            size="small"
                            checked={form.featureIds.includes(feature.id) || locked}
                            onChange={() => toggleFeature(feature.id)}
                            disabled={locked}
                          />
                        )}
                        label={(
                          <Box>
                            <Typography variant="body2">{feature.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{feature.code}</Typography>
                          </Box>
                        )}
                      />
                    );
                  })}
                </Box>
              </Box>
            ))}
          </Box>
          {isAdminRole && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
              The admin role must keep dashboard.access.
            </Typography>
          )}

          {dialogError && (
            <Box role="alert" sx={{ mt: 2, p: 1.5, border: "1px solid #B5402A", bgcolor: "rgba(181,64,42,0.06)" }}>
              <Typography variant="body2" color="secondary">{dialogError}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={create.loading || update.loading}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={create.loading || update.loading || !form.name.trim()}>
            {create.loading || update.loading ? "Saving…" : "Save role"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete role?"
        confirmLabel="Delete"
        danger
        loading={remove.loading}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      >
        <Typography variant="body2">
          “{pendingDelete?.name}” will be removed from {pendingDelete?.member_count ?? 0} member(s). The admin role is protected.
        </Typography>
      </ConfirmDialog>

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
        {featureCodeById.size} features are available.
      </Typography>
    </Box>
  );
}
