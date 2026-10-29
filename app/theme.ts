import { createTheme, type Theme } from "@mui/material/styles";

export type ThemeMode = "light" | "dark";

// Honya — Kanagawa-wave bookshop palette.
// Paper / ink / deep sea / vermillion hanko / brass gold.
export const honyaPalette = {
  paper: "#ECE3CE",
  paperDeep: "#D9CCB0",
  foam: "#F7F2E6",
  ink: "#16202E",
  inkSoft: "#3A4657",
  seaDeep: "#0F2847",
  sea: "#1D4E7E",
  wave: "#2E6B9E",
  vermillion: "#B5402A",
  vermillionDeep: "#8E3220",
  gold: "#C19A5B",
  wood: "#6B4A2F",
  moss: "#4A5D4E",
  night: "#0B1624",
  nightPaper: "#16202E",
  moonInk: "#F7F2E6",
  moonSoft: "#B9C3CE",
} as const;

// Mode-specific colours live here so the whole shop can be re-skinned in one place.
export const honyaModePalette = {
  light: {
    primary: {
      main: honyaPalette.seaDeep,
      dark: "#0A1C33",
      light: honyaPalette.sea,
      contrastText: honyaPalette.foam,
    },
    secondary: {
      main: honyaPalette.vermillion,
      dark: honyaPalette.vermillionDeep,
      light: "#D46044",
      contrastText: honyaPalette.foam,
    },
    background: { default: honyaPalette.paper, paper: honyaPalette.foam },
    text: { primary: honyaPalette.ink, secondary: honyaPalette.inkSoft },
    divider: "rgba(22,32,46,0.16)",
    cardShadow: "rgba(15,40,71,0.14)",
    buttonShadow: "rgba(22,32,46,0.9)",
  },
  dark: {
    primary: {
      main: "#5B92BF",
      dark: honyaPalette.sea,
      light: "#8DB6D6",
      contrastText: honyaPalette.night,
    },
    secondary: {
      main: "#D46044",
      dark: honyaPalette.vermillion,
      light: "#E58A70",
      contrastText: honyaPalette.night,
    },
    background: { default: honyaPalette.night, paper: honyaPalette.nightPaper },
    text: { primary: honyaPalette.moonInk, secondary: honyaPalette.moonSoft },
    divider: "rgba(247,242,230,0.16)",
    cardShadow: "rgba(0,0,0,0.4)",
    buttonShadow: "rgba(0,0,0,0.55)",
  },
} as const;

export const honyaTypography = {
  fontFamily: '"Newsreader", "Hiragino Mincho ProN", Georgia, serif',
  h1: { fontFamily: '"Shippori Mincho B1", "Hiragino Mincho ProN", Georgia, serif', fontWeight: 800, letterSpacing: "-0.01em" },
  h2: { fontFamily: '"Shippori Mincho B1", "Hiragino Mincho ProN", Georgia, serif', fontWeight: 800 },
  h3: { fontFamily: '"Shippori Mincho B1", "Hiragino Mincho ProN", Georgia, serif', fontWeight: 700 },
  h4: { fontFamily: '"Shippori Mincho B1", "Hiragino Mincho ProN", Georgia, serif', fontWeight: 700 },
  h5: { fontFamily: '"Shippori Mincho B1", "Hiragino Mincho ProN", Georgia, serif', fontWeight: 700 },
  h6: { fontFamily: '"Shippori Mincho B1", "Hiragino Mincho ProN", Georgia, serif', fontWeight: 700 },
  button: { textTransform: "none", fontWeight: 600, letterSpacing: "0.02em" },
} as const;

export const honyaShape = { borderRadius: 3 } as const;

function honyaComponents(mode: ThemeMode) {
  const colors = honyaModePalette[mode];

  return {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "var(--honya-paper)",
          color: "var(--honya-ink)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 3,
          "&.MuiButton-contained": { boxShadow: `3px 3px 0 ${colors.buttonShadow}` },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          border: `1px solid ${colors.divider}`,
          boxShadow: `5px 5px 0 ${colors.cardShadow}`,
          backgroundImage: "none",
        },
      },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 3 } } },
    MuiTextField: { defaultProps: { size: "small" as const } },
  };
}

export function createHonyaTheme(mode: ThemeMode): Theme {
  const colors = honyaModePalette[mode];

  return createTheme({
    palette: {
      mode,
      primary: colors.primary,
      secondary: colors.secondary,
      background: colors.background,
      text: colors.text,
      divider: colors.divider,
    },
    typography: honyaTypography,
    shape: honyaShape,
    components: honyaComponents(mode),
  });
}

// Object form for simple swapping: honyaThemes[mode].
export const honyaThemes: Record<ThemeMode, Theme> = {
  light: createHonyaTheme("light"),
  dark: createHonyaTheme("dark"),
};
