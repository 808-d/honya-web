import { Link as RouterLink } from "react-router";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { BookCard, WaveDivider } from "../shared/components";
import { useProducts } from "../hooks";
import type { Book } from "../models/book";

function ShelfRow({ title, jp, books, to }: { title: string; jp: string; books: Book[]; to: string }) {
  if (books.length === 0) return null;
  return (
    <Box sx={{ mt: { xs: 4, md: 6 } }}>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
        <Typography variant="h4" sx={{ fontSize: { xs: "1.4rem", sm: "1.8rem", md: "2.1rem" } }}>{title}</Typography>
        <Typography variant="body2" sx={{ letterSpacing: "0.3em", opacity: 0.6 }}>{jp}</Typography>
        <Button component={RouterLink} to={to} size="small" endIcon={<ArrowForwardIcon fontSize="small" />} sx={{ ml: "auto" }}>
          Full shelf
        </Button>
      </Box>
      <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" } }}>
        {books.slice(0, 4).map((b, i) => (
          <BookCard key={b.id} book={b} index={i} />
        ))}
      </Box>
      <Box className="honya-wood" sx={{ height: 12, mt: 2, boxShadow: "0 6px 12px rgba(22,32,46,0.25)" }} />
    </Box>
  );
}

export default function HomePage() {
  const { books, total, loading, source } = useProducts({ status: "active", perPage: 12 });
  const featured = books.slice(0, 4);
  const newArrivals = books.filter((b) => b.newArrival).slice(0, 4);

  return (
    <Box>
      {/* Hero — reading room */}
      <Box className="honya-seigaiha" sx={{ color: "#F7F2E6", position: "relative", overflow: "hidden" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 5, sm: 6, md: 9 }, px: { xs: 2, sm: 3 }, display: "grid", gap: 4, gridTemplateColumns: { xs: "1fr", md: "1.5fr 0.5fr" } }}>
          <Box className="honya-rise">
            <Chip label="本日の開店 · OPEN TODAY 10–22" sx={{ bgcolor: "#B5402A", color: "#F7F2E6", mb: 2, maxWidth: "100%" }} />
            <Typography variant="h2" sx={{ fontSize: { xs: 32, sm: 44, md: 64 }, lineHeight: 1.05 }}>
              A harbour bookshop
              <br />
              for every shore.
            </Typography>
            <Typography sx={{ mt: 2, maxWidth: 560, opacity: 0.85, fontSize: { xs: "0.95rem", md: "1rem" } }}>
              Concrete floors, cedar shelves, washi dust jackets. {total} volumes of manga, light novels,
              novels, art books &amp; magazines — stamped, strung, and wrapped at the counter.
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5, mt: 3, flexWrap: "wrap", flexDirection: { xs: "column", sm: "row" } }}>
              <Button component={RouterLink} to="/products" variant="contained" color="secondary" size="large" endIcon={<ArrowForwardIcon />}>
                Browse the shelves
              </Button>
              <Button component={RouterLink} to="/register" variant="outlined" size="large" sx={{ color: "#F7F2E6", borderColor: "rgba(247,242,230,0.5)" }}>
                Create account
              </Button>
            </Box>
            <Box sx={{ display: "flex", gap: 1, mt: 3, flexWrap: "wrap" }}>
              {["manga", "novel", "artbook", "magazine", "light-novel"].map((t) => (
                <Chip key={t} label={`#${t}`} component={RouterLink} to={`/products?kind=${t}`} clickable sx={{ color: "#F7F2E6", borderColor: "rgba(247,242,230,0.35)" }} variant="outlined" />
              ))}
            </Box>
          </Box>
          <Box sx={{ display: { xs: "none", md: "flex" }, justifyContent: "flex-end" }}>
            <Typography className="honya-tategaki" sx={{ opacity: 0.8, fontSize: 20 }}>
              波の音と紙の香り
            </Typography>
          </Box>
        </Container>
      </Box>

      <WaveDivider />

      <Container maxWidth="lg" sx={{ pb: 2, px: { xs: 2, sm: 3 } }}>
        {source === "shelf" && (
          <Box sx={{ mt: 3, p: 1.5, border: "1px dashed rgba(22,32,46,0.4)", bgcolor: "#F7F2E6", textAlign: "center" }}>
            <Typography variant="caption" sx={{ letterSpacing: "0.15em" }}>
              ⚠ OFFLINE SHELF — honya-api unreachable, showing local dummy data.
            </Typography>
          </Box>
        )}

        <ShelfRow title="Clerk's picks" jp="店主の推し" books={featured} to="/products" />
        <ShelfRow title="New arrivals" jp="新入荷" books={newArrivals} to="/products" />

        {!loading && featured.length === 0 && newArrivals.length === 0 && (
          <Box sx={{ mt: 6, p: 4, textAlign: "center", border: "1px dashed rgba(22,32,46,0.4)", bgcolor: "#F7F2E6" }}>
            <Typography variant="h6">The shelves are being restocked.</Typography>
            <Typography variant="body2" color="text.secondary">Add products to honya-api and they’ll appear here.</Typography>
            <Button component={RouterLink} to="/products" sx={{ mt: 2 }} variant="contained">Visit the shelves</Button>
          </Box>
        )}

        {/* Library card banner */}
        <Box
          className="honya-ruled"
          sx={{ mt: { xs: 5, md: 7 }, p: { xs: 2.5, md: 4 }, bgcolor: "#F7F2E6", border: "1px solid rgba(22,32,46,0.25)", boxShadow: "6px 6px 0 rgba(15,40,71,0.15)", display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr auto" }, alignItems: "center" }}
        >
          <Box>
            <Typography variant="overline" sx={{ letterSpacing: "0.3em" }}>貸出カード · LOAN CARD Nº HNY-0417</Typography>
            <Typography variant="h5" sx={{ mt: 0.5, fontSize: { xs: "1.1rem", md: "1.5rem" } }}>Every 5th stamp is a free volume.</Typography>
            <Typography variant="body2" color="text.secondary">Show this screen at the Kanda counter. Stamps never expire — like good paperbacks.</Typography>
          </Box>
          <Button component={RouterLink} to="/profile" variant="contained" color="primary" sx={{ width: { xs: "100%", md: "auto" } }}>
            View my shelf
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
