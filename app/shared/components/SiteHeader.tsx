import { useState } from "react";
import { Link as RouterLink, useLocation } from "react-router";
import AppBar from "@mui/material/AppBar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Popover from "@mui/material/Popover";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import MenuIcon from "@mui/icons-material/Menu";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import FurinIcon from "./FurinIcon";
import HonyaMark from "./HonyaMark";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { dummyNotices } from "../../dummy_data/users";

const NAV = [
  { to: "/", label: "Reading room" },
  { to: "/products", label: "Shelves" },
];

export default function SiteHeader() {
  const { pathname, search } = useLocation();
  const current = `${pathname}${search}`;
  const [open, setOpen] = useState(false);
  const [chimeAnchor, setChimeAnchor] = useState<HTMLElement | null>(null);
  const [accountAnchor, setAccountAnchor] = useState<HTMLElement | null>(null);
  const chimeOpen = Boolean(chimeAnchor);
  const accountOpen = Boolean(accountAnchor);
  const { user, logout } = useAuth();
  const { cartCount } = useCart();

  return (
    <Box sx={{ position: "sticky", top: 0, zIndex: 50 }}>
      <Box className="honya-seigaiha honya-drift" sx={{ height: 10 }} />
      <AppBar position="static" elevation={0} sx={{ bgcolor: "#F7F2E6", color: "#16202E", borderBottom: "1px solid rgba(22,32,46,0.2)" }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 1.5, py: 1 }}>
            <IconButton
              aria-label="Open navigation"
              onClick={() => setOpen(true)}
              sx={{ display: { xs: "inline-flex", md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Box
              component={RouterLink}
              to="/"
              sx={{ display: "flex", alignItems: "center", gap: 1.5, textDecoration: "none", color: "inherit" }}
            >
              <HonyaMark size={34} sx={{ height: { xs: 32, sm: 34 }, fontSize: { xs: 12, sm: 13 }, px: 1, gap: "2px" }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: "0.14em", lineHeight: 1, fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                  HONYA
                </Typography>
                <Typography variant="caption" sx={{ letterSpacing: "0.28em", opacity: 0.7, display: { xs: "none", sm: "block" } }}>
                  神奈川文庫 · EST. 1962
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 0.5, ml: 3 }}>
              {NAV.map((n) => {
                const active = current === n.to || (n.to === "/products" && pathname === "/products" && search === "");
                return (
                  <Button
                    key={n.label}
                    component={RouterLink}
                    to={n.to}
                    size="small"
                    variant={active ? "contained" : "text"}
                    color={active ? "primary" : "inherit"}
                    startIcon={n.label === "Shelves" ? <MenuBookIcon fontSize="small" /> : undefined}
                  >
                    {n.label}
                  </Button>
                );
              })}
            </Box>

            <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography variant="caption" sx={{ display: { xs: "none", lg: "block" }, opacity: 0.65, letterSpacing: "0.12em", mr: 1 }}>
                {user ? `@${user.username}` : ""}
              </Typography>
              {/* Furin wind-chime notifications — Honya's answer to the bell */}
              <IconButton
                className="furin-btn"
                aria-label={`Counter notices, ${dummyNotices.length} unread`}
                aria-haspopup="true"
                aria-expanded={chimeOpen ? "true" : undefined}
                onClick={(e) => setChimeAnchor(e.currentTarget)}
                sx={{ color: "#0F2847" }}
              >
                <Badge badgeContent={dummyNotices.length} color="secondary">
                  <FurinIcon className="furin-chime" />
                </Badge>
              </IconButton>
              <Popover
                open={chimeOpen}
                anchorEl={chimeAnchor}
                onClose={() => setChimeAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{ paper: { sx: { width: 300, bgcolor: "#F7F2E6", border: "1px solid rgba(22,32,46,0.25)" } } }}
              >
                <Box sx={{ p: 2, pb: 1, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <Typography variant="overline" sx={{ letterSpacing: "0.25em" }}>風鈴 · NOTICES</Typography>
                  <Typography variant="caption" color="text.secondary">swaying in the breeze</Typography>
                </Box>
                <Box sx={{ display: "grid", gap: 1.5, p: 2, pt: 1 }}>
                  {dummyNotices.map((n) => (
                    <Box key={n.id} sx={{ display: "flex", gap: 1.5 }}>
                      <Chip size="small" label={n.label} color="secondary" variant="outlined" sx={{ flexShrink: 0 }} />
                      <Box>
                        <Typography variant="body2">{n.text}</Typography>
                        <Typography variant="caption" color="text.secondary">{n.date}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button component={RouterLink} to="/profile" size="small" fullWidth variant="outlined" onClick={() => setChimeAnchor(null)}>
                    View my account
                  </Button>
                </Box>
              </Popover>
              {user ? (
                <Box sx={{ display: { xs: "none", sm: "block" } }}>
                  <Button
                    size="small"
                    color="inherit"
                    onClick={(event) => setAccountAnchor(event.currentTarget)}
                    aria-haspopup="menu"
                    aria-expanded={accountOpen ? "true" : undefined}
                    startIcon={<AccountCircleIcon fontSize="small" />}
                    endIcon={<KeyboardArrowDownIcon fontSize="small" />}
                    sx={{ maxWidth: 220 }}
                  >
                    <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      Hi, {user.display_name || user.username}
                    </Box>
                  </Button>
                  <Menu
                    anchorEl={accountAnchor}
                    open={accountOpen}
                    onClose={() => setAccountAnchor(null)}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                    slotProps={{ paper: { sx: { minWidth: 200, mt: 1, bgcolor: "#F7F2E6", border: "1px solid rgba(22,32,46,0.25)" } } }}
                  >
                    <MenuItem
                      component={RouterLink}
                      to="/profile"
                      onClick={() => setAccountAnchor(null)}
                    >
                      My account
                    </MenuItem>
                    <Divider />
                    <MenuItem
                      onClick={() => {
                        setAccountAnchor(null);
                        logout();
                      }}
                    >
                      Log out
                    </MenuItem>
                  </Menu>
                </Box>
              ) : (
                <Button component={RouterLink} to="/login" size="small" color="inherit" sx={{ display: { xs: "none", sm: "inline-flex" } }}>
                  Log in
                </Button>
              )}
              <Button
                component={RouterLink}
                to="/cart"
                size="small"
                variant="contained"
                color="secondary"
                startIcon={<ShoppingBasketIcon fontSize="small" />}
              >
                Basket · {cartCount}
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 260, p: 2 }} role="presentation" onClick={() => setOpen(false)}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            <HonyaMark size={36} />
            <Typography variant="overline" sx={{ letterSpacing: "0.3em" }}>本屋 HONYA</Typography>
          </Box>
          <List>
            {NAV.map((n) => (
              <ListItemButton key={n.label} component={RouterLink} to={n.to} selected={current === n.to}>
                <ListItemText primary={n.label} />
              </ListItemButton>
            ))}
            {user ? (
              <ListItemButton component={RouterLink} to="/profile">
                <ListItemText primary="My account" />
              </ListItemButton>
            ) : null}
            {user ? (
              <ListItemButton onClick={logout}>
                <ListItemText primary="Log out" />
              </ListItemButton>
            ) : (
              <ListItemButton component={RouterLink} to="/login">
                <ListItemText primary="Log in" />
              </ListItemButton>
            )}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
}
