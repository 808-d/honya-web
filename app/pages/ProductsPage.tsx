import { useMemo, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Slider from "@mui/material/Slider";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TuneIcon from "@mui/icons-material/Tune";
import { BookCard } from "../shared/components";
import { useProducts } from "../hooks";
import { KIND_LABEL, type Book, type ProductKind } from "../models/book";

const KINDS: ProductKind[] = ["manga", "light-novel", "novel", "artbook", "magazine"];
const PRICE_MIN = 0;
const PRICE_MAX = 20000;
const PRICE_STEP = 100;
const YEAR_MIN = 2000;
const YEAR_MAX = new Date().getFullYear();

type SortKey = "featured" | "price-asc" | "price-desc" | "newest";

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const kind = params.get("kind") ?? "all";
  const status = params.get("status") ?? "all";
  const q = params.get("q") ?? "";
  const minPrice = Number(params.get("min") ?? PRICE_MIN);
  const maxPrice = Number(params.get("max") ?? PRICE_MAX);
  const page = Number(params.get("page") ?? 1);

  const { books, total, perPage, source, loading, error } = useProducts({
    kind,
    status,
    search: q,
    minPrice: minPrice > PRICE_MIN ? minPrice : undefined,
    maxPrice: maxPrice < PRICE_MAX ? maxPrice : undefined,
    page,
  });

  const [sort, setSort] = useState<SortKey>("featured");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [years, setYears] = useState<[number, number]>([YEAR_MIN, YEAR_MAX]);
  const [yearActive, setYearActive] = useState(false);

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    }
    if (!("page" in patch)) next.delete("page");
    setParams(next);
  };

  const visible = useMemo(() => {
    let out = books;
    if (inStockOnly) out = out.filter((b) => b.stock > 0);
    if (yearActive) {
      out = out.filter(
        (b) => b.publishedYear === undefined || (b.publishedYear >= years[0] && b.publishedYear <= years[1]),
      );
    }
    switch (sort) {
      case "price-asc": return [...out].sort((a, b) => a.price - b.price);
      case "price-desc": return [...out].sort((a, b) => b.price - a.price);
      case "newest": return [...out].sort((a, b) => (b.publishedYear ?? 0) - (a.publishedYear ?? 0));
      default: return out;
    }
  }, [books, inStockOnly, yearActive, years, sort]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const goPage = (p: number) => {
    const next = new URLSearchParams(params);
    if (p <= 1) next.delete("page");
    else next.set("page", String(p));
    setParams(next);
  };

  const hasFilters =
    kind !== "all" || status !== "all" || q !== "" || minPrice !== PRICE_MIN || maxPrice !== PRICE_MAX;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3 } }}>
      <Typography variant="overline" sx={{ letterSpacing: "0.3em" }}>棚 · THE SHELVES</Typography>
      <Typography variant="h3" sx={{ mt: 0.5, fontSize: { xs: "1.7rem", sm: "2.4rem", md: "3rem" } }}>
        Books from every shore
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 620 }}>
        {total} volumes live from the honya-api catalogue — manga, light novels, novels, art books
        &amp; magazines.
      </Typography>

      {source === "shelf" && (
        <Box sx={{ mt: 2, p: 1.5, border: "1px dashed var(--honya-line-strong)", bgcolor: "var(--honya-foam)" }}>
          <Typography variant="caption" sx={{ letterSpacing: "0.15em" }}>
            ⚠ OFFLINE SHELF — honya-api unreachable{error ? ` (${error})` : ""}. Showing local dummy data.
          </Typography>
        </Box>
      )}

      {/* Kind chips — horizontal scroll on mobile */}
      <Box sx={{ display: "flex", gap: 1, mt: 3, overflowX: "auto", pb: 1, mx: { xs: -2, sm: 0 }, px: { xs: 2, sm: 0 } }}>
        <Chip
          label="All"
          clickable
          color={kind === "all" ? "secondary" : "default"}
          variant={kind === "all" ? "filled" : "outlined"}
          onClick={() => update({ kind: null })}
        />
        {KINDS.map((k) => (
          <Chip
            key={k}
            label={KIND_LABEL[k]}
            clickable
            color={kind === k ? "secondary" : "default"}
            variant={kind === k ? "filled" : "outlined"}
            onClick={() => update({ kind: k })}
            sx={{ flexShrink: 0 }}
          />
        ))}
      </Box>

      {/* Search + sort + availability */}
      <Box sx={{ display: "flex", gap: 1.5, mt: 2, flexWrap: "wrap", alignItems: "center" }}>
        <TextField
          placeholder="Search title, author, tag…"
          value={q}
          size="small"
          onChange={(e) => update({ q: e.target.value })}
          sx={{ flex: { xs: "1 1 100%", sm: "1 1 240px" }, maxWidth: { sm: 300 }, bgcolor: "background.paper" }}
        />
        <Select
          size="small"
          value={status}
          onChange={(e) => update({ status: e.target.value === "all" ? null : e.target.value })}
          sx={{ bgcolor: "background.paper", minWidth: 140, flex: { xs: "1 1 auto", sm: "0 auto" } }}
        >
          <MenuItem value="all">Any status</MenuItem>
          <MenuItem value="active">On sale</MenuItem>
          <MenuItem value="draft">Draft</MenuItem>
          <MenuItem value="archived">Archived</MenuItem>
        </Select>
        <Select
          size="small"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          sx={{ bgcolor: "background.paper", minWidth: 140, flex: { xs: "1 1 auto", sm: "0 auto" } }}
        >
          <MenuItem value="featured">Featured</MenuItem>
          <MenuItem value="price-asc">Price ↑</MenuItem>
          <MenuItem value="price-desc">Price ↓</MenuItem>
          <MenuItem value="newest">Newest</MenuItem>
        </Select>
      </Box>

      <Box sx={{ display: "grid", gap: 3, mt: 3, gridTemplateColumns: { xs: "1fr", md: "240px 1fr" }, alignItems: "start" }}>
        {/* Sidebar — desktop only */}
        <Box sx={{ display: { xs: "none", md: "block" }, position: "sticky", top: 110, bgcolor: "var(--honya-foam)", border: "1px solid var(--honya-line)", p: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="subtitle2" sx={{ letterSpacing: "0.2em" }}>絞り込み FILTERS</Typography>
            {hasFilters && <Button size="small" onClick={() => setParams(new URLSearchParams())}>Clear</Button>}
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: "grid", gap: 3 }}>
            <Box>
              <Typography variant="overline" sx={{ letterSpacing: "0.2em" }}>
                値段 PRICE ¥{minPrice.toLocaleString()} — ¥{maxPrice.toLocaleString()}
              </Typography>
              <Slider
                value={[minPrice, maxPrice]}
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={PRICE_STEP}
                onChange={(_, v) => {
                  const [lo, hi] = v as [number, number];
                  update({ min: lo <= PRICE_MIN ? null : String(lo), max: hi >= PRICE_MAX ? null : String(hi) });
                }}
                valueLabelDisplay="auto"
                sx={{ mt: 1 }}
              />
            </Box>
            <Box>
              <FormControlLabel
                control={<Switch size="small" checked={yearActive} onChange={(e) => setYearActive(e.target.checked)} />}
                label={<Typography variant="overline" sx={{ letterSpacing: "0.2em" }}>刊行 PUBLISHED</Typography>}
              />
              <Slider
                value={years}
                min={YEAR_MIN}
                max={YEAR_MAX}
                step={1}
                disabled={!yearActive}
                onChange={(_, v) => setYears(v as [number, number])}
                valueLabelDisplay="auto"
                sx={{ mt: 1 }}
              />
              <Typography variant="caption" color="text.secondary">refines the loaded page</Typography>
            </Box>
            <FormControlLabel
              control={<Switch size="small" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />}
              label="In stock only"
            />
          </Box>
        </Box>

        {/* Results */}
        <Box sx={{ minWidth: 0 }}>
          {/* Mobile filter row */}
          <Box sx={{ display: { xs: "flex", md: "none" }, gap: 1, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
            <Button variant="outlined" size="small" startIcon={<TuneIcon />} onClick={() => update({ min: minPrice > 0 ? null : "0" })}>
              In stock
            </Button>
            <FormControlLabel control={<Switch size="small" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />} label="Stock" />
          </Box>

          {loading ? (
            <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)" } }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Box key={i} sx={{ bgcolor: "var(--honya-foam)", border: "1px solid var(--honya-line)", height: 380, opacity: 0.7 }} />
              ))}
            </Box>
          ) : visible.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center", border: "1px dashed var(--honya-line-strong)", bgcolor: "var(--honya-foam)" }}>
              <Typography variant="h6">No cards in this drawer.</Typography>
              <Typography variant="body2" color="text.secondary">Widen the price range or clear a filter.</Typography>
              <Box sx={{ display: "flex", gap: 1, justifyContent: "center", mt: 2, flexWrap: "wrap" }}>
                <Button onClick={() => setParams(new URLSearchParams())} variant="outlined">Clear search</Button>
              </Box>
            </Box>
          ) : (
            <>
              <Typography variant="caption" sx={{ display: "block", letterSpacing: "0.2em" }}>
                {visible.length} OF {total} VOLUMES · STAMPED &amp; STRUNG
              </Typography>
              <Box sx={{ display: "grid", gap: 2.5, mt: 1.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)" } }}>
                {visible.map((b, i) => (
                  <BookCard key={b.id} book={b} index={i} />
                ))}
              </Box>
              <Box className="honya-wood" sx={{ height: 12, mt: 3 }} />

              {totalPages > 1 && (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, mt: 4 }}>
                  <IconButton onClick={() => goPage(page - 1)} disabled={page <= 1} aria-label="Previous page">
                    <ChevronLeftIcon />
                  </IconButton>
                  <Typography variant="body2" sx={{ letterSpacing: "0.15em" }}>
                    PAGE {page} / {totalPages}
                  </Typography>
                  <IconButton onClick={() => goPage(page + 1)} disabled={page >= totalPages} aria-label="Next page">
                    <ChevronRightIcon />
                  </IconButton>
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>
    </Container>
  );
}
