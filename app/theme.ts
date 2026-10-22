import { createTheme } from "@mui/material/styles";

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
} as const;

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: honyaPalette.seaDeep, dark: "#0A1C33", light: honyaPalette.sea, contrastText: honyaPalette.foam },
    secondary: { main: honyaPalette.vermillion, dark: honyaPalette.vermillionDeep, light: "#D46044", contrastText: honyaPalette.foam },
    background: { default: honyaPalette.paper, paper: honyaPalette.foam },
    text: { primary: honyaPalette.ink, secondary: honyaPalette.inkSoft },
    divider: "rgba(22,32,46,0.16)",
  },
  typography: {
    fontFamily: '"Newsreader", "Hiragino Mincho ProN", Georgia, serif',
    h1: { fontFamily: '"Shippori Mincho B1", "Hiragino Mincho ProN", Georgia, serif', fontWeight: 800, letterSpacing: "-0.01em" },
    h2: { fontFamily: '"Shippori Mincho B1", "Hiragino Mincho ProN", Georgia, serif', fontWeight: 800 },
    h3: { fontFamily: '"Shippori Mincho B1", "Hiragino Mincho ProN", Georgia, serif', fontWeight: 700 },
    h4: { fontFamily: '"Shippori Mincho B1", "Hiragino Mincho ProN", Georgia, serif', fontWeight: 700 },
    h5: { fontFamily: '"Shippori Mincho B1", "Hiragino Mincho ProN", Georgia, serif', fontWeight: 700 },
    h6: { fontFamily: '"Shippori Mincho B1", "Hiragino Mincho ProN", Georgia, serif', fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600, letterSpacing: "0.02em" },
  },
  shape: { borderRadius: 3 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: honyaPalette.paper },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 3,
          "&.MuiButton-contained": { boxShadow: "3px 3px 0 rgba(22,32,46,0.9)" },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          border: "1px solid rgba(22,32,46,0.18)",
          boxShadow: "5px 5px 0 rgba(15,40,71,0.14)",
        },
      },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 3 } } },
    MuiTextField: { defaultProps: { size: "small" } },
  },
});

export default theme;
