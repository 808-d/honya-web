import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import { SiteHeader, SiteFooter } from "./shared/components";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "icon", type: "image/svg+xml", href: "/honya-icon.svg" },
  { rel: "apple-touch-icon", href: "/honya-icon.svg" },
  { rel: "manifest", href: "/manifest.webmanifest" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&family=Shippori+Mincho+B1:wght@600;700;800&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0F2847" />
        <Meta />
        <Links />
      </head>
      <body className="honya-grain">
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <CartProvider>
              <SiteHeader />
              <main style={{ position: "relative", zIndex: 2, minHeight: "70vh" }}>{children}</main>
              <SiteFooter />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Torn page.";
  let details = "This slip isn’t in the drawer.";

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404 · Missing slip" : "Error";
    details =
      error.status === 404
        ? "The requested shelf could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
  }

  return (
    <main style={{ padding: 48, maxWidth: 640, margin: "0 auto" }}>
      <h1 style={{ fontFamily: '"Shippori Mincho B1", serif' }}>{message}</h1>
      <p>{details}</p>
    </main>
  );
}
