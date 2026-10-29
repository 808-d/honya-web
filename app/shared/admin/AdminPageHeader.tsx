import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export function AdminPageHeader({
  kicker,
  title,
  description,
  action,
}: {
  kicker: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 2, flexWrap: "wrap", mb: 3 }}>
      <Box>
        <Typography variant="overline" sx={{ letterSpacing: "0.3em", color: "text.secondary" }}>
          {kicker}
        </Typography>
        <Typography variant="h4" sx={{ mt: 0.25 }}>{title}</Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 620 }}>
            {description}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  );
}
