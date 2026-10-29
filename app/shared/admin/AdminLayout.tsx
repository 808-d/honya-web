import { useState } from "react";
import { Link as RouterLink, Navigate, Outlet, useLocation, useNavigate } from "react-router";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import GroupIcon from "@mui/icons-material/Group";
import StorefrontIcon from "@mui/icons-material/Storefront";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import { HonyaMark, ThemeToggle } from "../components";
import { useAuth } from "../../contexts/AuthContext";

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  feature?: string;
  end?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", to: "/admin", icon: <DashboardIcon fontSize="small" />, end: true }],
  },
  {
    label: "Catalog",
    items: [
      { label: "Products", to: "/admin/products", icon: <MenuBookIcon fontSize="small" />, feature: "catalog.read" },
      { label: "Authors", to: "/admin/authors", icon: <GroupIcon fontSize="small" />, feature: "catalog.read" },
      { label: "Genres", to: "/admin/genres", icon: <LocalOfferIcon fontSize="small" />, feature: "catalog.read" },
      { label: "Publishers", to: "/admin/publishers", icon: <StorefrontIcon fontSize="small" />, feature: "catalog.read" },
      { label: "Tags", to: "/admin/tags", icon: <LocalOfferIcon fontSize="small" />, feature: "catalog.read" },
    ],
  },
  {
    label: "Commerce",
    items: [
      { label: "Orders", to: "/admin/orders", icon: <ReceiptLongIcon fontSize="small" />, feature: "order.read" },
      { label: "Coupons", to: "/admin/coupons", icon: <LocalOfferIcon fontSize="small" />, feature: "coupon.read" },
    ],
  },
  {
    label: "Access",
    items: [
      { label: "Roles", to: "/admin/roles", icon: <AdminPanelSettingsIcon fontSize="small" />, feature: "role.read" },
      { label: "Users", to: "/admin/users", icon: <GroupIcon fontSize="small" />, feature: "user.read" },
    ],
  },
];

const DRAWER_WIDTH = 264;

function isActive(pathname: string, item: NavItem): boolean {
  if (item.end) return pathname === item.to;
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, roles, hasFeature, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: "#0F2847", color: "#F7F2E6" }}>
      <Box sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 1.25 }}>
        <HonyaMark size={34} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" sx={{ lineHeight: 1.1, color: "#F7F2E6" }}>Honya</Typography>
          <Typography variant="caption" sx={{ letterSpacing: "0.2em", opacity: 0.65 }}>BACK COUNTER</Typography>
        </Box>
      </Box>
      <Divider sx={{ borderColor: "rgba(247,242,230,0.15)" }} />

      <Box sx={{ flex: 1, overflowY: "auto", py: 1 }}>
        {NAV.map((group) => {
          const items = group.items.filter((item) => !item.feature || hasFeature(item.feature));
          if (items.length === 0) return null;
          return (
            <Box key={group.label} sx={{ mb: 1 }}>
              <Typography
                variant="caption"
                sx={{ display: "block", px: 2.5, pt: 1.5, pb: 0.5, letterSpacing: "0.22em", opacity: 0.5 }}
              >
                {group.label.toUpperCase()}
              </Typography>
              <List dense disablePadding>
                {items.map((item) => (
                  <ListItemButton
                    key={item.to}
                    component={RouterLink}
                    to={item.to}
                    onClick={onNavigate}
                    selected={isActive(pathname, item)}
                    sx={{
                      mx: 1,
                      mb: 0.25,
                      color: "inherit",
                      "&.Mui-selected": { bgcolor: "rgba(247,242,230,0.16)" },
                      "&.Mui-selected:hover": { bgcolor: "rgba(247,242,230,0.22)" },
                      "&:hover": { bgcolor: "rgba(247,242,230,0.08)" },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 34, color: "inherit", opacity: 0.8 }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} slotProps={{ primary: { sx: { fontSize: 14 } } }} />
                  </ListItemButton>
                ))}
              </List>
            </Box>
          );
        })}
      </Box>

      <Divider sx={{ borderColor: "rgba(247,242,230,0.15)" }} />
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {user?.display_name || user?.username}
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
          {roles.slice(0, 3).map((role) => (
            <Chip
              key={role}
              size="small"
              label={role}
              sx={{ height: 20, fontSize: 10, color: "#F7F2E6", borderColor: "rgba(247,242,230,0.3)" }}
              variant="outlined"
            />
          ))}
        </Box>
        <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
          <Button
            component={RouterLink}
            to="/"
            size="small"
            startIcon={<StorefrontIcon fontSize="small" />}
            sx={{ color: "#F7F2E6", borderColor: "rgba(247,242,230,0.3)" }}
            variant="outlined"
          >
            Storefront
          </Button>
          <Button
            size="small"
            startIcon={<LogoutIcon fontSize="small" />}
            onClick={async () => {
              await logout();
              navigate("/admin/login");
            }}
            sx={{ color: "#F7F2E6", borderColor: "rgba(247,242,230,0.3)" }}
            variant="outlined"
          >
            Log out
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

function AccessDenied() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "var(--honya-paper)", p: 3 }}>
      <Box sx={{ maxWidth: 460, bgcolor: "var(--honya-foam)", border: "1px solid var(--honya-line-strong)", p: 4, boxShadow: "6px 6px 0 var(--honya-shadow-strong)", textAlign: "center" }}>
        <Typography variant="overline" sx={{ letterSpacing: "0.3em" }}>403 · NO ADMITTANCE</Typography>
        <Typography variant="h5" sx={{ mt: 1 }}>The back counter is closed to this account.</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {user ? `Signed in as ${user.username}, but no role grants dashboard.access.` : "Sign in with an account that has dashboard access."}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center", mt: 3, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={async () => {
              await logout();
              navigate("/admin/login", { replace: true });
            }}
          >
            Sign in as another user
          </Button>
          <Button component={RouterLink} to="/" variant="outlined">Storefront</Button>
        </Box>
      </Box>
    </Box>
  );
}

export default function AdminLayout() {
  const { user, loading, permissionsLoading, hasFeature } = useAuth();
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading || (user && permissionsLoading)) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "var(--honya-paper)" }}>
        <Typography variant="body2" color="text.secondary">Opening the back counter…</Typography>
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!hasFeature("dashboard.access")) {
    return <AccessDenied />;
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "var(--honya-paper)" }}>
      {desktop ? (
        <Box component="nav" sx={{ width: DRAWER_WIDTH, flexShrink: 0 }}>
          <Box sx={{ position: "fixed", inset: "0 auto 0 0", width: DRAWER_WIDTH }}>
            <SidebarContent />
          </Box>
        </Box>
      ) : (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ "& .MuiDrawer-paper": { width: DRAWER_WIDTH, border: 0 } }}
        >
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </Drawer>
      )}

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: "var(--honya-header)",
            color: "var(--honya-ink)",
            borderBottom: "1px solid var(--honya-line)",
            backdropFilter: "blur(8px)",
          }}
        >
          <Toolbar sx={{ gap: 1, minHeight: 60 }}>
            {!desktop && (
              <IconButton edge="start" aria-label="Open navigation" onClick={() => setMobileOpen(true)}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="overline" sx={{ letterSpacing: "0.28em", color: "text.secondary" }}>
              HONYA · BACK COUNTER
            </Typography>
            <Box sx={{ flex: 1 }} />
            <ThemeToggle />
            <Tooltip title="Open the storefront">
              <IconButton component={RouterLink} to="/" aria-label="Open the storefront">
                <StorefrontIcon />
              </IconButton>
            </Tooltip>
            <Chip size="small" label={user.display_name || user.username} variant="outlined" />
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 3 }, maxWidth: 1400, width: "100%", mx: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
