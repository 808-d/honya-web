import { useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import StarIcon from "@mui/icons-material/Star";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import { BookCard, BookCover } from "../shared/components";
import { useProduct } from "../hooks";
import {
  AVAILABILITY_LABEL,
  KIND_LABEL,
  REGION_LABEL,
  STATUS_LABEL,
  type Book,
} from "../models/book";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { book, related, loading, notFound } = useProduct(id);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: "grid", gap: 4, gridTemplateColumns: { xs: "1fr", md: "380px 1fr" } }}>
          <Box sx={{ bgcolor: "#F7F2E6", border: "1px solid rgba(22,32,46,0.2)", height: 440 }} />
          <Box sx={{ display: "grid", gap: 2, alignContent: "start" }}>
            {[60, 320, 200, 140].map((w, i) => (
              <Box key={i} sx={{ bgcolor: "#F7F2E6", height: 28, width: w, maxWidth: "100%" }} />
            ))}
          </Box>
        </Box>
      </Container>
    );
  }

  if (notFound || !book) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: "center" }}>
        <Typography variant="overline" sx={{ letterSpacing: "0.3em" }}>404 · 品切れ</Typography>
        <Typography variant="h4" sx={{ mt: 1 }}>No such slip in the drawer.</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          This volume may have been unlisted or the link mistyped.
        </Typography>
        <Button component={RouterLink} to="/products" variant="contained" sx={{ mt: 3 }}>
          Back to the shelves
        </Button>
      </Container>
    );
  }

  return <ProductDetail book={book} related={related} />;
}

function ProductDetail({ book, related }: { book: Book; related: Book[] }) {
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setQty(1);
  }, [book.id]);

  const max = Math.max(book.stock, 1);
  const soldOut = book.stock === 0;
  const clamp = (n: number) => Math.min(Math.max(n, 1), max);

  const colophon: Array<[string, string]> = [];
  if (book.isbn) colophon.push(["ISBN", book.isbn]);
  if (book.publisher) colophon.push(["Publisher", book.publisher]);
  if (book.pages) colophon.push(["Pages", String(book.pages)]);
  if (book.language) colophon.push(["Language", book.language]);
  if (book.publishedYear) colophon.push(["Year", String(book.publishedYear)]);
  colophon.push(["Stock", String(book.stock)]);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3 } }}>
      <Breadcrumbs sx={{ mb: 3, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
        <Box component={RouterLink} to="/" style={{ color: "inherit" }}>Reading room</Box>
        <Box component={RouterLink} to="/products" style={{ color: "inherit" }}>Shelves</Box>
        <Typography color="text.primary" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: { xs: 140, sm: 320 } }}>{book.title}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: "grid", gap: { xs: 3, md: 4 }, gridTemplateColumns: { xs: "1fr", md: "380px 1fr" } }}>
        <Box sx={{ maxWidth: { xs: 480, md: "none" }, width: "100%" }}>
          <BookCover book={book} height={440} />
          <Box className="honya-wood" sx={{ height: 12 }} />
          <Box sx={{ mt: 2, p: 2, bgcolor: "#F7F2E6", border: "1px solid rgba(22,32,46,0.2)" }}>
            <Typography variant="caption" sx={{ letterSpacing: "0.25em" }}>書誌 · COLOPHON</Typography>
            {colophon.map(([k, v]) => (
              <Box key={k} sx={{ display: "flex", justifyContent: "space-between", py: 0.5, borderBottom: "1px dotted rgba(22,32,46,0.25)" }}>
                <Typography variant="body2" color="text.secondary">{k}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{v}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip label={KIND_LABEL[book.kind]} color="primary" />
            {book.availability ? <Chip label={AVAILABILITY_LABEL[book.availability]} variant="outlined" /> : null}
            {book.region ? <Chip label={REGION_LABEL[book.region]} variant="outlined" /> : null}
            {book.status ? <Chip label={STATUS_LABEL[book.status]} variant="outlined" /> : null}
            {book.volume ? <Chip label={`Volume ${book.volume}`} variant="outlined" /> : null}
            {book.newArrival ? <Chip label="新入荷 new" color="secondary" /> : null}
          </Box>
          <Typography variant="h3" sx={{ mt: 1.5, fontSize: { xs: "1.6rem", sm: "2.2rem", md: "3rem" } }}>{book.title}</Typography>
          {book.originalTitle && book.originalTitle !== book.title ? (
            <Typography sx={{ letterSpacing: "0.25em", opacity: 0.6 }}>{book.originalTitle}</Typography>
          ) : null}
          <Typography variant="body1" sx={{ mt: 1 }}>
            {book.author}{book.artist && book.artist !== book.author ? ` · ill. ${book.artist}` : ""}
          </Typography>
          <Typography sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
            {book.rating !== undefined && <StarIcon fontSize="small" sx={{ color: "#C19A5B" }} />}
            {book.rating !== undefined && <strong>{book.rating.toFixed(1)}</strong>}
            <Typography variant="body2" color="text.secondary" component="span">
              {book.rating !== undefined ? "· " : ""}{book.stock} on the shelf
            </Typography>
          </Typography>
          {book.description ? (
            <Typography variant="body1" sx={{ mt: 2, maxWidth: 560, lineHeight: 1.7 }}>{book.description}</Typography>
          ) : null}
          {book.genres && book.genres.length > 0 && (
            <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
              {book.genres.map((g) => (
                <Chip key={g} label={g} variant="outlined" />
              ))}
            </Box>
          )}
          <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
            {book.tags.map((t) => (
              <Chip key={t} label={`#${t}`} component={RouterLink} to={`/products?q=${t}`} clickable variant="outlined" />
            ))}
          </Box>

          <Box sx={{ display: "flex", gap: 2, mt: 3, p: 2.5, bgcolor: "#0F2847", color: "#F7F2E6", boxShadow: "5px 5px 0 rgba(22,32,46,0.25)", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "stretch", sm: "center" } }}>
            <Box>
              <Typography variant="caption" sx={{ letterSpacing: "0.25em", opacity: 0.7 }}> counter price</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{book.currency}{book.price.toLocaleString()}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.65 }}>
                {book.currency}{(book.price * qty).toLocaleString()} for {qty} {qty === 1 ? "copy" : "copies"}
              </Typography>
            </Box>
            <Box sx={{ ml: { sm: "auto" }, display: "flex", gap: 1.5, flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "stretch", sm: "center" } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="caption" sx={{ letterSpacing: "0.2em", opacity: 0.7, mr: 0.5 }}>
                  数量 QTY
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    bgcolor: "#F7F2E6",
                    color: "#16202E",
                    borderRadius: 1,
                    border: "1px solid rgba(247,242,230,0.4)",
                    overflow: "hidden",
                  }}
                >
                  <IconButton
                    aria-label="Decrease quantity"
                    size="small"
                    onClick={() => setQty((v) => clamp(v - 1))}
                    disabled={soldOut || qty <= 1}
                    sx={{ borderRadius: 0 }}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography
                    aria-live="polite"
                    sx={{ minWidth: 36, textAlign: "center", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}
                  >
                    {soldOut ? 0 : qty}
                  </Typography>
                  <IconButton
                    aria-label="Increase quantity"
                    size="small"
                    onClick={() => setQty((v) => clamp(v + 1))}
                    disabled={soldOut || qty >= max}
                    sx={{ borderRadius: 0 }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
              <Box sx={{ display: "flex", gap: 1, flexDirection: { xs: "column", sm: "row" } }}>
                <Button variant="outlined" sx={{ color: "#F7F2E6", borderColor: "rgba(247,242,230,0.4)" }} disabled={soldOut}>Reserve</Button>
                <Button variant="contained" color="secondary" startIcon={<ShoppingBasketIcon />} disabled={soldOut}>
                  {soldOut ? "Sold out" : `Add ${qty} to basket`}
                </Button>
              </Box>
            </Box>
          </Box>
          <Typography variant="caption" sx={{ display: "block", mt: 1.5, opacity: 0.65 }}>
            Wrapped in washi + twine. Dummy checkout — no charge, only stamps.
          </Typography>
        </Box>
      </Box>

      {related.length > 0 && (
        <>
          <Typography variant="h5" sx={{ mt: { xs: 5, md: 7 }, mb: 2 }}>From the same drawer</Typography>
          <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" } }}>
            {related.map((b, i) => (
              <BookCard key={b.id} book={b} index={i} />
            ))}
          </Box>
        </>
      )}
    </Container>
  );
}
