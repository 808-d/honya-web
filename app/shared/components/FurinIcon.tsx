import SvgIcon, { type SvgIconProps } from "@mui/material/SvgIcon";

// Furin — Japanese glass wind chime. Used as Honya's notification mark
// instead of a generic bell: wooden cap, glass dome, clapper + paper tanzaku.
export default function FurinIcon(props: SvgIconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" fill="none" {...props}>
      {/* hanging string */}
      <line x1="12" y1="1.5" x2="12" y2="4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      {/* wooden cap */}
      <rect x="7.5" y="4" width="9" height="2.6" rx="1.3" fill="currentColor" opacity="0.9" />
      {/* glass dome */}
      <path
        d="M8 6.6h8l-1.1 5.2a3.2 3.2 0 0 1-5.8 0L8 6.6Z"
        fill="currentColor"
        opacity="0.28"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* wave etching on glass */}
      <path
        d="M9.2 9.2c.7-.7 1.5-.7 2.2 0s1.5.7 2.2 0"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.9"
      />
      {/* clapper string + bead */}
      <line x1="12" y1="11.8" x2="12" y2="14.2" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="12" cy="15.1" r="1" fill="currentColor" />
      {/* paper tanzaku */}
      <rect x="10.6" y="16.4" width="2.8" height="6" rx="0.4" fill="currentColor" opacity="0.85" />
      <line x1="12" y1="17.8" x2="12" y2="20.6" stroke="#F7F2E6" strokeWidth="0.9" strokeLinecap="round" />
    </SvgIcon>
  );
}
