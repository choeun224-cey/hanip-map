import { ImageResponse } from "next/og";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf9f6",
        }}
      >
        <svg width="160" height="192" viewBox="0 0 40 48">
          <path
            d="M20 0C9 0 0 9 0 20C0 32 20 48 20 48C20 48 40 32 40 20C40 9 31 0 20 0Z"
            fill="#ff6b35"
          />
          <circle cx="20" cy="19" r="11" fill="#ffffff" />
          <line
            x1="14.5"
            y1="24.5"
            x2="25.5"
            y2="13.5"
            stroke="#ff6b35"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <line
            x1="17.5"
            y1="27"
            x2="28"
            y2="16"
            stroke="#ff6b35"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
