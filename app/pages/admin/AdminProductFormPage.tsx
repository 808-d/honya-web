import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { AdminPageHeader } from "../../shared/admin/AdminPageHeader";
import { useAuth } from "../../contexts/AuthContext";
import {
  useAdminProduct,
  useCreateProduct,
  useUpdateProduct,
  useRelations,
} from "../../hooks";
import { PRODUCT_TYPE_LABEL } from "../../models/admin";
import type { ProductInput } from "../../models/admin";

interface FormState {
  title: string;
  cover: string;
  description: string;
  publisher_id: string;
  publish_time: string;
  stock: string;
  price: string;
  status: string;
  type: string;
  author_ids: string[];
  genre_ids: string[];
  tag_ids: string[];
}

const EMPTY: FormState = {
  title: "",
  cover: "",
  description: "",
  publisher_id: "",
  publish_time: "",
  stock: "0",
  price: "0",
  status: "1",
  type: "0",
  author_ids: [],
  genre_ids: [],
  tag_ids: [],
};

type RelationOption = { id: string; name: string };

function optionsFrom(map: Map<string, string>): RelationOption[] {
  return [...map.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export default function AdminProductFormPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { hasFeature } = useAuth();
  const canWrite = hasFeature("catalog.write");
  const isEdit = Boolean(id);

  const product = useAdminProduct(id);
  const { relations } = useRelations();
  const create = useCreateProduct();
  const update = useUpdateProduct();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!product.data) return;
    setForm({
      title: product.data.title,
      cover: product.data.cover ?? "",
      description: product.data.description ?? "",
      publisher_id: product.data.publisher_id ?? "",
      publish_time: product.data.publish_time ? product.data.publish_time.slice(0, 10) : "",
      stock: String(product.data.stock),
      price: String(product.data.price),
      status: String(product.data.status),
      type: String(product.data.type),
      author_ids: product.data.author_ids ?? [],
      genre_ids: product.data.genre_ids ?? [],
      tag_ids: product.data.tag_ids ?? [],
    });
  }, [product.data]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const input: ProductInput = {
      title: form.title.trim(),
      cover: form.cover.trim(),
      description: form.description.trim(),
      publisher_id: form.publisher_id || null,
      publish_time: form.publish_time ? new Date(`${form.publish_time}T00:00:00Z`).toISOString() : null,
      stock: Number(form.stock) || 0,
      price: Number(form.price) || 0,
      status: Number(form.status),
      type: Number(form.type),
      author_ids: form.author_ids,
      genre_ids: form.genre_ids,
      tag_ids: form.tag_ids,
    };

    try {
      if (id) {
        await update.mutate({ id, input });
      } else {
        await create.mutate(input);
      }
      nav("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this product.");
    }
  };

  if (isEdit && product.loading) {
    return <Typography variant="body2" color="text.secondary">Loading product…</Typography>;
  }

  if (isEdit && product.error) {
    return (
      <Box>
        <AdminPageHeader kicker="目録 · CATALOG" title="Product not found" />
        <Typography variant="body2" color="secondary">{product.error}</Typography>
        <Button component={RouterLink} to="/admin/products" variant="outlined" sx={{ mt: 2 }}>Back to products</Button>
      </Box>
    );
  }

  return (
    <Box>
      <AdminPageHeader
        kicker="目録 · CATALOG"
        title={isEdit ? "Edit product" : "New product"}
        description={isEdit ? "Changes go live as soon as they are saved." : "Add a volume to the catalog. Drafts stay hidden from the shelves."}
        action={<Button component={RouterLink} to="/admin/products" variant="outlined">Back to list</Button>}
      />

      <Box
        component="form"
        onSubmit={submit}
        sx={{ bgcolor: "var(--honya-foam)", border: "1px solid var(--honya-line)", p: { xs: 2, md: 3 }, boxShadow: "5px 5px 0 var(--honya-shadow)" }}
      >
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
          <TextField label="Title" required value={form.title} onChange={(e) => set("title", e.target.value)} sx={{ gridColumn: { md: "1 / -1" } }} />
          <TextField label="Cover URL" value={form.cover} onChange={(e) => set("cover", e.target.value)} placeholder="https://…" />
          <TextField label="Publisher" select value={form.publisher_id} onChange={(e) => set("publisher_id", e.target.value)}>
            <MenuItem value="">No publisher</MenuItem>
            {optionsFrom(relations.publishers).map((option) => (
              <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
            ))}
          </TextField>
          <TextField label="Publish date" type="date" value={form.publish_time} onChange={(e) => set("publish_time", e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          <TextField label="Type" select value={form.type} onChange={(e) => set("type", e.target.value)}>
            {Object.entries(PRODUCT_TYPE_LABEL).map(([value, label]) => (
              <MenuItem key={value} value={value}>{label}</MenuItem>
            ))}
          </TextField>
          <TextField label="Status" select value={form.status} onChange={(e) => set("status", e.target.value)}>
            <MenuItem value="0">Draft</MenuItem>
            <MenuItem value="1">Active</MenuItem>
            <MenuItem value="2">Archived</MenuItem>
          </TextField>
          <TextField label="Price" type="number" slotProps={{ htmlInput: { min: 0, step: "0.01" } }} value={form.price} onChange={(e) => set("price", e.target.value)} />
          <TextField label="Stock" type="number" slotProps={{ htmlInput: { min: 0, step: 1 } }} value={form.stock} onChange={(e) => set("stock", e.target.value)} />
          <TextField label="Description" multiline minRows={4} value={form.description} onChange={(e) => set("description", e.target.value)} sx={{ gridColumn: { md: "1 / -1" } }} />
          <Autocomplete
            multiple
            options={optionsFrom(relations.authors)}
            getOptionLabel={(option) => option.name}
            value={optionsFrom(relations.authors).filter((option) => form.author_ids.includes(option.id))}
            onChange={(_, value) => set("author_ids", value.map((option) => option.id))}
            renderInput={(params) => <TextField {...params} label="Authors" />}
          />
          <Autocomplete
            multiple
            options={optionsFrom(relations.genres)}
            getOptionLabel={(option) => option.name}
            value={optionsFrom(relations.genres).filter((option) => form.genre_ids.includes(option.id))}
            onChange={(_, value) => set("genre_ids", value.map((option) => option.id))}
            renderInput={(params) => <TextField {...params} label="Genres" />}
          />
          <Autocomplete
            multiple
            options={optionsFrom(relations.tags)}
            getOptionLabel={(option) => option.name}
            value={optionsFrom(relations.tags).filter((option) => form.tag_ids.includes(option.id))}
            onChange={(_, value) => set("tag_ids", value.map((option) => option.id))}
            renderInput={(params) => <TextField {...params} label="Tags" />}
          />
        </Box>

        {error && (
          <Box role="alert" sx={{ mt: 2, p: 1.5, border: "1px solid #B5402A", bgcolor: "rgba(181,64,42,0.06)" }}>
            <Typography variant="body2" color="secondary">{error}</Typography>
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 1.5, mt: 3 }}>
          <Button type="submit" variant="contained" color="primary" disabled={!canWrite || create.loading || update.loading}>
            {create.loading || update.loading ? "Saving…" : isEdit ? "Save changes" : "Create product"}
          </Button>
          <Button component={RouterLink} to="/admin/products" variant="outlined">Cancel</Button>
        </Box>
        {!canWrite && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            Your role can view the catalog but not change it.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
