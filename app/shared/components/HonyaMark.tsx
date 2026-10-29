import Box, { type BoxProps } from "@mui/material/Box";

// HonyaMark — the site's hanko seal: a vermillion square with 本屋 stacked
// vertically, like a real shop stamp. Every logo on the site uses this.
export default function HonyaMark({ size = 44, sx, ...rest }: { size?: number } & BoxProps) {
  return (
    <Box
      aria-hidden
      {...rest}
      sx={{
        height: size,
        width: size,
        flexShrink: 0,
        bgcolor: "#B5402A",
        color: "#F7F2E6",
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 1,
        boxShadow: "2px 2px 0 rgba(22,32,46,0.85)",
        fontFamily: '"Shippori Mincho B1", "Hiragino Mincho ProN", serif',
        fontWeight: 800,
        lineHeight: 0.92,
        fontSize: size * 0.4,
        letterSpacing: 0,
        whiteSpace: "nowrap",
        userSelect: "none",
        ...sx,
      }}
    >
      <span>本</span>
      <span>屋</span>
    </Box>
  );
}
