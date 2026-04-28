import { ImageResponse } from "next/og";

export const alt = "한입지도 - 둘이서 모은 맛집 지도";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadGoogleFont(font: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(
    text
  )}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/
  );
  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status === 200) return response.arrayBuffer();
  }
  throw new Error("failed to load font data");
}

export default async function Image() {
  const title = "한입지도";
  const subtitle = "둘이서 모은 맛집을 지도에 기록하고";
  const subtitle2 = "다음 한 입을 찾아보세요";

  const fontData = await loadGoogleFont(
    "Noto+Sans+KR:wght@900",
    title + subtitle + subtitle2
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #ff6b35 0%, #ff8c42 50%, #ffa552 100%)",
          fontFamily: "NotoSansKR",
          color: "white",
          padding: 60,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              fontSize: 96,
              filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.2))",
            }}
          >
            📍
          </div>
          <div
            style={{
              fontSize: 144,
              fontWeight: 900,
              letterSpacing: "-0.04em",
              textShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontSize: 40,
            fontWeight: 900,
            opacity: 0.95,
            lineHeight: 1.4,
            textAlign: "center",
          }}
        >
          <div>{subtitle}</div>
          <div>{subtitle2}</div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 48,
            fontSize: 36,
          }}
        >
          <span>🍴</span>
          <span>🥢</span>
          <span>☕</span>
          <span>🍜</span>
          <span>🍰</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "NotoSansKR",
          data: fontData,
          style: "normal",
          weight: 900,
        },
      ],
    }
  );
}
