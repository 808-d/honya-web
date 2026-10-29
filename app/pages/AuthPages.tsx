import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { HonyaMark } from "../shared/components";
import { useAuth } from "../contexts/AuthContext";
import { useForgotPassword, useRegister, useResetPassword, useVerifyRegister } from "../hooks";

function CardShell({ kicker, title, jp, children }: { kicker: string; title: string; jp: string; children: React.ReactNode }) {
  return (
    <Container maxWidth="sm" sx={{ py: 7 }}>
      <Box className="honya-rise" sx={{ bgcolor: "var(--honya-foam)", border: "1px solid var(--honya-line-strong)", boxShadow: "7px 7px 0 var(--honya-shadow-strong)" }}>
        <Box className="honya-seigaiha" sx={{ height: 12 }} />
        <Box sx={{ p: { xs: 3, md: 4 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
            <HonyaMark size={34} />
            <Typography variant="overline" sx={{ letterSpacing: "0.3em" }}>{kicker}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 2 }}>
            <Typography variant="h4">{title}</Typography>
            <Typography sx={{ letterSpacing: "0.3em", opacity: 0.55 }}>{jp}</Typography>
          </Box>
          <Box sx={{ mt: 3, display: "grid", gap: 2 }}>{children}</Box>
        </Box>
        <Box className="honya-wood" sx={{ height: 10 }} />
      </Box>
    </Container>
  );
}

function ErrorNote({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <Box role="alert" sx={{ p: 1.5, border: "1px solid #B5402A", bgcolor: "rgba(181,64,42,0.06)" }}>
      <Typography variant="body2" color="secondary">{children}</Typography>
    </Box>
  );
}

function SuccessNote({ children }: { children: React.ReactNode }) {
  return (
    <Box role="status" sx={{ p: 1.5, border: "1px solid var(--honya-line-strong)", bgcolor: "rgba(193,154,91,0.12)" }}>
      <Typography variant="body2">{children}</Typography>
    </Box>
  );
}

export function LoginPage() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError(null);
    try {
      await login({
        identifier: String(form.get("identifier") ?? "").trim(),
        password: String(form.get("password") ?? ""),
      });
      nav("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Is honya-api running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardShell kicker="受付 · COUNTER" title="Log in" jp="入店">
      <Box component="form" onSubmit={submit} sx={{ display: "grid", gap: 2 }}>
        <TextField name="identifier" label="Email or member Nº" placeholder="aoi@example.com" required fullWidth />
        <TextField name="password" label="Password" type="password" required fullWidth />
        <ErrorNote>{error}</ErrorNote>
        <Button type="submit" variant="contained" color="primary" size="large" disabled={loading}>
          {loading ? "Logging in…" : "Log in"}
        </Button>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box component={RouterLink} to="/forgot-password" style={{ fontSize: 13 }}>Forgot password?</Box>
        <Box component={RouterLink} to="/register" style={{ fontSize: 13 }}>Create account →</Box>
      </Box>
    </CardShell>
  );
}

export function RegisterPage() {
  const register = useRegister();
  const [done, setDone] = useState<string | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const username = String(form.get("username") ?? "").trim();
    try {
      const result = await register.mutate({
        username,
        display_name: String(form.get("display_name") ?? "").trim() || username,
        email: String(form.get("email") ?? "").trim(),
        password: String(form.get("password") ?? ""),
      });
      setDone(`Account created for ${result.username}. Check ${result.email} to verify before logging in.`);
    } catch {
      /* surfaced via register.error */
    }
  };

  return (
    <CardShell kicker="新規 · REGISTER" title="Create account" jp="登録">
      {done ? (
        <>
          <SuccessNote>{done}</SuccessNote>
          <Button component={RouterLink} to="/login" variant="contained" color="secondary" size="large">Go to log in</Button>
        </>
      ) : (
        <>
          <Box component="form" onSubmit={submit} sx={{ display: "grid", gap: 2 }}>
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
              <TextField name="display_name" label="Display name" placeholder="Aoi Tachibana" fullWidth />
              <TextField name="username" label="Username" placeholder="aoi" required fullWidth />
            </Box>
            <TextField name="email" label="Email" type="email" placeholder="aoi@example.com" required fullWidth />
            <TextField name="password" label="Password" type="password" required helperText="8+ characters, like a good chapter." fullWidth />
            <ErrorNote>{register.error}</ErrorNote>
            <Button type="submit" variant="contained" color="secondary" size="large" disabled={register.loading}>
              {register.loading ? "Creating account…" : "Create account"}
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Already have an account? <Box component={RouterLink} to="/login" style={{ color: "inherit" }}>Log in</Box>
          </Typography>
        </>
      )}
    </CardShell>
  );
}

export function ForgotPasswordPage() {
  const forgot = useForgotPassword();
  const [sent, setSent] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await forgot.mutate({ email: String(form.get("email") ?? "").trim() });
      setSent(true);
    } catch {
      /* surfaced via forgot.error */
    }
  };

  return (
    <CardShell kicker="再発行 · FORGOT PASSWORD" title="Forgot password" jp="再発行">
      {sent ? (
        <>
          <Typography variant="h6">Reset link sent ✉</Typography>
          <SuccessNote>If that email is registered, a password reset link is on its way.</SuccessNote>
          <Button component={RouterLink} to="/login" variant="outlined">Back to log in</Button>
        </>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary">
            Enter the email for your account and we’ll send a password reset link.
          </Typography>
          <Box component="form" onSubmit={submit} sx={{ display: "grid", gap: 2 }}>
            <TextField name="email" type="email" label="Email" placeholder="aoi@example.com" required fullWidth />
            <ErrorNote>{forgot.error}</ErrorNote>
            <Button type="submit" variant="contained" color="primary" size="large" disabled={forgot.loading}>
              {forgot.loading ? "Sending…" : "Send reset link"}
            </Button>
          </Box>
          <Box component={RouterLink} to="/login" style={{ fontSize: 13 }}>← Back to log in</Box>
        </>
      )}
    </CardShell>
  );
}

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const reset = useResetPassword();
  const [done, setDone] = useState(false);
  const id = params.get("id") ?? "";
  const token = params.get("token") ?? "";
  const linkValid = Boolean(id && token);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    if (password !== String(form.get("confirm") ?? "")) return;
    try {
      await reset.mutate({ id, token, password });
      setDone(true);
    } catch {
      /* surfaced via reset.error */
    }
  };

  return (
    <CardShell kicker="再発行 · RESET PASSWORD" title="Reset password" jp="再設定">
      {done ? (
        <>
          <Typography variant="h6">Password reset ✓</Typography>
          <SuccessNote>Your new password is set. You can log in now.</SuccessNote>
          <Button component={RouterLink} to="/login" variant="contained" color="primary" size="large">Go to log in</Button>
        </>
      ) : !linkValid ? (
        <>
          <ErrorNote>This reset link is missing its id or token. Please request a new one.</ErrorNote>
          <Button component={RouterLink} to="/forgot-password" variant="outlined">Request a new link</Button>
        </>
      ) : (
        <Box component="form" onSubmit={submit} sx={{ display: "grid", gap: 2 }}>
          <TextField name="password" label="New password" type="password" required helperText="8+ characters." fullWidth />
          <TextField name="confirm" label="Confirm password" type="password" required fullWidth />
          <ErrorNote>{reset.error}</ErrorNote>
          <Button type="submit" variant="contained" color="primary" size="large" disabled={reset.loading}>
            {reset.loading ? "Resetting…" : "Reset password"}
          </Button>
        </Box>
      )}
    </CardShell>
  );
}

export function VerifyPage() {
  const [params] = useSearchParams();
  const id = params.get("id") ?? "";
  const token = params.get("token") ?? "";
  const { data, loading, error } = useVerifyRegister(id, token);
  const { refresh } = useAuth();

  useEffect(() => {
    if (!loading && !error) void refresh();
  }, [loading, error, refresh]);

  return (
    <CardShell kicker="確認 · VERIFY EMAIL" title="Email verification" jp="確認">
      {loading ? (
        <Typography variant="body2" color="text.secondary">Verifying your email…</Typography>
      ) : error ? (
        <>
          <Typography variant="h6">Verification failed</Typography>
          <ErrorNote>{error}</ErrorNote>
          <Typography variant="body2" color="text.secondary">
            The link may have expired. Log in and request a new one, or register again.
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button component={RouterLink} to="/login" variant="contained" color="primary">Back to log in</Button>
            <Button component={RouterLink} to="/register" variant="outlined">Register again</Button>
          </Box>
        </>
      ) : (
        <>
          <Typography variant="h6">Email verified ✓</Typography>
          <SuccessNote>
            Your account is active{data?.user?.display_name ? `, ${data.user.display_name}` : ""}. You’re now logged in.
          </SuccessNote>
          <Button component={RouterLink} to="/profile" variant="contained" color="primary" size="large">
            Continue to your account
          </Button>
        </>
      )}
    </CardShell>
  );
}
