interface LogoProps {
  size?: number;
  className?: string;
  primary?: string;
  inner?: string;
}

export default function Logo({
  size = 64,
  className = "",
  primary = "#ff6b35",
  inner = "#ffffff",
}: LogoProps) {
  return (
    <svg
      width={size}
      height={(size * 6) / 5}
      viewBox="0 0 40 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="한입지도"
    >
      <path
        d="M20 0C9 0 0 9 0 20C0 32 20 48 20 48C20 48 40 32 40 20C40 9 31 0 20 0Z"
        fill={primary}
      />
      <circle cx="20" cy="19" r="11" fill={inner} />
      <line
        x1="14.5"
        y1="24.5"
        x2="25.5"
        y2="13.5"
        stroke={primary}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <line
        x1="17.5"
        y1="27"
        x2="28"
        y2="16"
        stroke={primary}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
