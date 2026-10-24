import { Link as RouterLink } from "react-router";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import HonyaMark from "./HonyaMark";
import { useAuth } from "../../contexts/AuthContext";

export default function SiteFooter() {
  const { user } = useAuth();
  const counterLinks = [
    ...(user ? [] : ([["/login", "Log in"], ["/register", "Register"]] as const)),
    ["/forgot-password", "Forgot password?"] as const,
  ];

  return (
    <Box component="footer" sx={{ mt: 8 }}>
      <Box className="honya-seigaiha" sx={{ height: 14, opacity: 0.95 }} />
      <Box sx={{ bgcolor: "#0F2847", color: "#F7F2E6" }}>
        <Container maxWidth="lg" sx={{ py: 5, display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "1.4fr 1fr 1fr" } }}>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <HonyaMark size={40} />
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: "0.12em" }}>
                本屋 HONYA
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.75, maxWidth: 360 }}>
              A concrete-and-paper bookshop for manga, novels &amp; books from every shore. Salt air, wood shelves,
              rubber stamps — every order wrapped like a library loan.
            </Typography>
            <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
              <span className="honya-hanko" style={{ background: "#B5402A", color: "#F7F2E6", fontSize: 11, padding: "4px 8px", letterSpacing: "0.2em" }}>
                神奈川
              </span>
              {/* Quiet attribution — part of the colophon, not a focal point */}
              <a href="https://deerflow.tech" target="_blank" rel="noreferrer" className="deerflow-mark" style={{ color: "#F7F2E6" }}>
                Created by Deerflow
              </a>
            </Box>
          </Box>
          <Box>
            <Typography variant="overline" sx={{ opacity: 0.6 }}>Shelves</Typography>
            {[
              ["/products", "All shelves"],
              ["/products?kind=manga", "Manga"],
              ["/products?kind=manhwa", "Manhwa"],
              ["/products?kind=novel", "Novels"],
              ["/products?kind=book", "Books"],
              ["/profile", "My account"],
            ].map(([to, label]) => (
              <Box key={label} component={RouterLink} to={to} sx={{ display: "block", color: "inherit", opacity: 0.85, textDecoration: "none", py: 0.4, "&:hover": { opacity: 1 } }}>
                {label}
              </Box>
            ))}
          </Box>
          <Box>
            <Typography variant="overline" sx={{ opacity: 0.6 }}>Counter</Typography>
            {counterLinks.map(([to, label]) => (
              <Box key={label} component={RouterLink} to={to} sx={{ display: "block", color: "inherit", opacity: 0.85, textDecoration: "none", py: 0.4, "&:hover": { opacity: 1 } }}>
                {label}
              </Box>
            ))}
            <Typography variant="caption" sx={{ display: "block", mt: 2, opacity: 0.55 }}>
              Kanda Jimbocho 2-4-7, Tokyo · Open 10–22, closed tides
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
