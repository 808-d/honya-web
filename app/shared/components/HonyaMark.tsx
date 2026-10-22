import Box, { type BoxProps } from "@mui/material/Box";

// HonyaMark — the site's hanko seal: vermillion block with 本屋 set
// horizontally, in Mincho like a real shop stamp. Use everywhere the brand appears.
export default function HonyaMark({ size = 44, sx, ...rest }: { size?: number } & BoxProps) {
  return (
    <Box
      aria-hidden
      {...rest}
      sx={{
        height: size,
        px: size * 0.24,
        flexShrink: 0,
        bgcolor: "#B5402A",
        color: "#F7F2E6",
        display: "inline-flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: size * 0.08,
        borderRadius: 1,
        boxShadow: "2px 2px 0 rgba(22,32,46,0.85)",
        fontFamily: '"Shippori Mincho B1", "Hiragino Mincho ProN", serif',
        fontWeight: 800,
        lineHeight: 1,
        fontSize: size * 0.5,
        letterSpacing: "0.08em",
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
