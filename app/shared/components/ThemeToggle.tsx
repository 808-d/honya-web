import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { useThemeMode } from "../../contexts/ThemeContext";

/** Toggles the Honya light/dark palette; the choice is persisted by ThemeContext. */
export default function ThemeToggle({ size = "small" }: { size?: "small" | "medium" | "large" }) {
  const { toggleMode } = useThemeMode();

  return (
    <Tooltip title="Toggle color theme">
      <IconButton
        color="inherit"
        size={size}
        onClick={toggleMode}
        aria-label="Toggle color theme"
      >
        <DarkModeOutlinedIcon className="honya-theme-icon-dark" fontSize="small" />
        <LightModeOutlinedIcon className="honya-theme-icon-light" fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
