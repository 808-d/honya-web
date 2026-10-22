import { Link as RouterLink } from "react-router";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { BookCover } from "../shared/components";
import { dummyNotices, dummyUser } from "../dummy_data/users";
import { getBookById } from "../dummy_data/books";

const STATUS_LABEL: Record<string, string> = {
  "on-shelf": "on shelf",
  "in-transit": "in transit",
  reading: "reading now",
};

export default function ProfilePage() {
  const current = getBookById(dummyUser.currentlyReadingId);

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography variant="overline" sx={{ letterSpacing: "0.3em" }}>利用者 · READER</Typography>
      <Typography variant="h3">My shelf</Typography>

      <Box sx={{ display: "grid", gap: 2.5, mt: 3, gridTemplateColumns: { xs: "1fr", md: "360px 1fr" } }}>
        {/* Member card */}
        <Box sx={{ bgcolor: "#0F2847", color: "#F7F2E6", p: 3, boxShadow: "6px 6px 0 rgba(22,32,46,0.25)", position: "relative", overflow: "hidden" }}>
          <Box className="honya-seigaiha" sx={{ position: "absolute", inset: 0, opacity: 0.35 }} />
          <Box sx={{ position: "relative" }}>
            <Typography variant="caption" sx={{ letterSpacing: "0.3em", opacity: 0.7 }}>貸出カード · HONYA MEMBER</Typography>
            <Typography variant="h5" sx={{ mt: 1 }}>{dummyUser.name}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>{dummyUser.handle} · {dummyUser.email}</Typography>
            <Box sx={{ display: "flex", gap: 3, mt: 2 }}>
              <Box><Typography variant="h6">{dummyUser.shelfCount}</Typography><Typography variant="caption">volumes</Typography></Box>
              <Box><Typography variant="h6">{dummyUser.memberNo}</Typography><Typography variant="caption">member Nº</Typography></Box>
              <Box><Typography variant="h6">{dummyUser.memberSince.split(" ")[1]}</Typography><Typography variant="caption">since</Typography></Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              <Button component={RouterLink} to="/products" size="small" variant="contained" color="secondary">Borrow more</Button>
              <Button size="small" variant="outlined" sx={{ color: "#F7F2E6", borderColor: "rgba(247,242,230,0.4)" }}>Edit card</Button>
            </Box>
          </Box>
        </Box>

        {/* Currently reading + notices */}
        <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
          <Box sx={{ bgcolor: "#F7F2E6", border: "1px solid rgba(22,32,46,0.2)", p: 2.5 }}>
            <Typography variant="overline">しおり · CURRENTLY READING</Typography>
            {current && (
              <>
                <Box sx={{ mt: 1.5 }}><BookCover book={current} height={180} /></Box>
                <Typography variant="subtitle1" sx={{ mt: 1.5, fontWeight: 700 }}>{current.title}</Typography>
                <Typography variant="body2" color="text.secondary">p. 84 / {current.pages} · bookmark: reef library</Typography>
                <Button component={RouterLink} to={`/products/${current.id}`} size="small" sx={{ mt: 1 }} variant="outlined">Open volume</Button>
              </>
            )}
          </Box>
          <Box className="honya-ruled" sx={{ bgcolor: "#F7F2E6", border: "1px solid rgba(22,32,46,0.2)", p: 2.5 }}>
            <Typography variant="overline">連絡 · COUNTER NOTICES</Typography>
            <Box sx={{ display: "grid", gap: 1.5, mt: 1.5 }}>
              {dummyNotices.map((n) => (
                <Box key={n.id} sx={{ display: "flex", gap: 1.5 }}>
                  <Chip size="small" label={n.label} color="secondary" variant="outlined" />
                  <Box>
                    <Typography variant="body2">{n.text}</Typography>
                    <Typography variant="caption" color="text.secondary">{n.date}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Loan history */}
      <Typography variant="h5" sx={{ mt: 5, mb: 1.5 }}>Loan history</Typography>
      <Box sx={{ bgcolor: "#F7F2E6", border: "1px solid rgba(22,32,46,0.2)" }}>
        {dummyUser.orders.map((o, i) => (
          <Box key={o.id} sx={{ display: "flex", gap: 2, alignItems: "center", p: 2, borderTop: i ? "1px dotted rgba(22,32,46,0.25)" : "none", flexWrap: "wrap" }}>
            <Box sx={{ minWidth: 110 }}><Typography variant="caption" sx={{ letterSpacing: "0.15em" }}>{o.id}</Typography><Typography variant="body2" color="text.secondary">{o.date}</Typography></Box>
            <Box component={RouterLink} to={`/products/${o.bookId}`} style={{ flex: 1, minWidth: 200, color: "inherit", textDecoration: "none", fontWeight: 700 }}>{o.title}</Box>
            <Chip size="small" label={STATUS_LABEL[o.status]} />
            <Typography sx={{ fontWeight: 700 }}>¥{o.price.toLocaleString()}</Typography>
          </Box>
        ))}
      </Box>
    </Container>
  );
}
