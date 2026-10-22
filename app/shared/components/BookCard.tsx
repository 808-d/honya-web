import { Link as RouterLink } from "react-router";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import StarIcon from "@mui/icons-material/Star";
import type { Book } from "../../models/book";
import { KIND_LABEL } from "../../models/book";

const MOTIF_GLYPH: Record<Book["coverMotif"], string> = {
  wave: "〜",
  moon: "月",
  plum: "梅",
  lantern: "灯",
};

export function BookCover({ book, height = 220 }: { book: Book; height?: number }) {
  const [a, b] = book.coverPalette;
  const soldOut = book.stock === 0;
  return (
    <Box
      sx={{
        height,
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(160deg, ${a} 0%, ${b} 100%)`,
        display: "flex",
      }}
    >
      {book.coverImage ? (
        <Box
          component="img"
          src={book.coverImage}
          alt={book.title}
          sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <>
          {/* spine */}
          <Box sx={{ width: 14, bgcolor: "rgba(0,0,0,0.28)", borderRight: "1px solid rgba(247,242,230,0.35)" }} />
          <Box sx={{ flex: 1, p: 1.6, display: "flex", flexDirection: "column", color: "#F7F2E6", minWidth: 0 }}>
            <Typography variant="caption" sx={{ letterSpacing: "0.2em", opacity: 0.75, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {book.originalTitle ?? book.title}
            </Typography>
            <Typography sx={{ fontFamily: '"Shippori Mincho B1", serif', fontWeight: 800, lineHeight: 1.15, mt: 0.5, fontSize: "1rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {book.title}
            </Typography>
            <Box sx={{ mt: "auto", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 1 }}>
              <Typography variant="caption" sx={{ opacity: 0.8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {book.publisher ?? book.author}
                {book.publishedYear ? ` · ${book.publishedYear}` : ""}
              </Typography>
              <Typography sx={{ fontFamily: '"Shippori Mincho B1", serif', fontSize: 44, lineHeight: 1, opacity: 0.9 }}>
                {MOTIF_GLYPH[book.coverMotif]}
              </Typography>
            </Box>
          </Box>
          {/* foam arcs */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              opacity: 0.16,
              backgroundImage:
                "radial-gradient(circle at 80% 100%, transparent 22%, #F7F2E6 23% 25%, transparent 26%), radial-gradient(circle at 80% 100%, transparent 36%, #F7F2E6 37% 39%, transparent 40%)",
              backgroundSize: "90px 45px",
              backgroundRepeat: "repeat-x",
              backgroundPosition: "bottom",
            }}
          />
        </>
      )}
      {soldOut ? (
        <Box className="honya-hanko" sx={{ position: "absolute", top: 10, right: 10, bgcolor: "#16202E", color: "#F7F2E6", fontSize: 10, px: 1, py: 0.4, letterSpacing: "0.18em" }}>
          SOLD OUT
        </Box>
      ) : book.stock <= 7 ? (
        <Box className="honya-hanko" sx={{ position: "absolute", top: 10, right: 10, bgcolor: "#B5402A", color: "#F7F2E6", fontSize: 10, px: 1, py: 0.4, letterSpacing: "0.18em" }}>
          LAST {book.stock}
        </Box>
      ) : null}
    </Box>
  );
}

export default function BookCard({ book, index = 0 }: { book: Book; index?: number }) {
  return (
    <Card
      className="honya-rise"
      component={RouterLink}
      to={`/products/${book.id}`}
      sx={{ textDecoration: "none", display: "flex", flexDirection: "column", height: "100%", animationDelay: `${Math.min(index, 8) * 70}ms`, "&:hover": { transform: "translateY(-3px)", transition: "transform .25s ease" } }}
    >
      <BookCover book={book} />
      {/* wood shelf lip */}
      <Box className="honya-wood" sx={{ height: 8 }} />
      <CardContent sx={{ flex: 1, p: { xs: 1.5, sm: 2 } }}>
        <Box sx={{ display: "flex", gap: 0.5, mb: 1, flexWrap: "wrap" }}>
          <Chip size="small" label={KIND_LABEL[book.kind]} variant="outlined" />
          {book.volume ? <Chip size="small" label={`vol. ${book.volume}`} /> : null}
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.25, fontSize: { xs: "0.9rem", sm: "1rem" } }}>
          {book.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {book.author}
          {book.publishedYear ? ` · ${book.publishedYear}` : ""}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1.5 }}>
          <Typography sx={{ display: "flex", alignItems: "center", gap: 0.5, fontWeight: 700 }}>
            {book.rating !== undefined ? (
              <>
                <StarIcon fontSize="small" sx={{ color: "#C19A5B" }} /> {book.rating.toFixed(1)}
              </>
            ) : (
              <Typography variant="caption" color="text.secondary" component="span">
                {book.availability === "active" ? "in stock" : book.availability ?? ""}
              </Typography>
            )}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: "1rem", sm: "1.25rem" } }}>
            {book.currency}{book.price.toLocaleString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
