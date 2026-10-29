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
import TablePagination from "@mui/material/TablePagination";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import EditIcon from "@mui/icons-material/EditOutlined";
import { AdminPageHeader } from "../../shared/admin/AdminPageHeader";
import { AdminTable, type AdminColumn } from "../../shared/admin/AdminTable";
import { useAuth } from "../../contexts/AuthContext";
import { useAdminUsers, useRoles, useUpdateUserRoles } from "../../hooks";
import { formatDate } from "../../lib/format";
import type { AdminUserDto } from "../../models/admin";

export default function AdminUsersPage() {
  const { hasFeature, user: currentUser } = useAuth();
  const canWrite = hasFeature("user.write");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(20);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const users = useAdminUsers({ search: search || undefined, page: page + 1, perPage });
  const roles = useRoles();
  const updateRoles = useUpdateUserRoles();

  const [editing, setEditing] = useState<AdminUserDto | null>(null);
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const [dialogError, setDialogError] = useState<string | null>(null);

  const openEdit = (person: AdminUserDto) => {
    const ids = (roles.data ?? [])
      .filter((role) => person.roles.includes(role.name))
      .map((role) => role.id);
    setEditing(person);
    setRoleIds(ids);
    setDialogError(null);
  };

  const toggleRole = (id: string) => {
    setRoleIds((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]));
  };

  const save = async () => {
    if (!editing) return;
    setDialogError(null);
    try {
      await updateRoles.mutate({ id: editing.id, roleIds });
      setEditing(null);
      users.refetch();
    } catch (err) {
      setDialogError(err instanceof Error ? err.message : "Could not update this person's roles.");
    }
  };

  const columns: Array<AdminColumn<AdminUserDto>> = [
    {
      key: "person",
      label: "Person",
      render: (person) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {person.display_name || person.username}
            {person.id === currentUser?.id && (
              <Typography component="span" variant="caption" color="text.secondary"> · you</Typography>
            )}
          </Typography>
          <Typography variant="caption" color="text.secondary">@{person.username}</Typography>
        </Box>
      ),
    },
    { key: "email", label: "Email", render: (person) => person.email },
    {
      key: "verified",
      label: "Verified",
      render: (person) => (
        <Chip size="small" variant="outlined" label={person.is_verified ? "Yes" : "No"} color={person.is_verified ? "success" : "default"} />
      ),
    },
    {
      key: "roles",
      label: "Roles",
      render: (person) => (
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          {person.roles.length === 0 ? (
            <Typography variant="caption" color="text.secondary">None</Typography>
          ) : (
            person.roles.map((role) => <Chip key={role} size="small" label={role} variant="outlined" sx={{ height: 20, fontSize: 10 }} />)
          )}
        </Box>
      ),
    },
    { key: "joined", label: "Joined", render: (person) => formatDate(person.create_time) },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (person) => (
        <IconButton size="small" aria-label={`Edit roles for ${person.username}`} onClick={() => openEdit(person)} disabled={!canWrite}>
          <EditIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Box>
      <AdminPageHeader
        kicker="会員 · USERS"
        title="Users"
        description="Everyone with an account. Assign roles here; roles decide which features they carry."
      />

      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center", mb: 2 }}>
        <TextField label="Search name or email" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} sx={{ minWidth: 240 }} />
        <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>{users.data?.total ?? 0} accounts</Typography>
      </Box>

      <AdminTable
        columns={columns}
        rows={users.data?.items ?? []}
        getKey={(person) => person.id}
        loading={users.loading}
        error={users.error || roles.error}
        empty="No accounts match that search."
      />

      <TablePagination
        component="div"
        count={users.data?.total ?? 0}
        page={page}
        onPageChange={(_, next) => setPage(next)}
        rowsPerPage={perPage}
        onRowsPerPageChange={(event) => { setPerPage(Number(event.target.value)); setPage(0); }}
        rowsPerPageOptions={[10, 20, 50]}
      />

      <Dialog open={Boolean(editing)} onClose={updateRoles.loading ? undefined : () => setEditing(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Roles for {editing?.display_name || editing?.username}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Check every role this person should carry.
          </Typography>
          <Box sx={{ display: "grid" }}>
            {(roles.data ?? []).map((role) => (
              <FormControlLabel
                key={role.id}
                control={<Checkbox size="small" checked={roleIds.includes(role.id)} onChange={() => toggleRole(role.id)} />}
                label={(
                  <Box>
                    <Typography variant="body2">{role.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {role.features.length ? role.features.join(" · ") : "No features"}
                    </Typography>
                  </Box>
                )}
              />
            ))}
          </Box>
          {editing?.id === currentUser?.id && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
              You cannot remove your own dashboard.access.
            </Typography>
          )}
          {dialogError && (
            <Box role="alert" sx={{ mt: 2, p: 1.5, border: "1px solid #B5402A", bgcolor: "rgba(181,64,42,0.06)" }}>
              <Typography variant="body2" color="secondary">{dialogError}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setEditing(null)} disabled={updateRoles.loading}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={updateRoles.loading}>
            {updateRoles.loading ? "Saving…" : "Save roles"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
