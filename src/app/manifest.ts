import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "한입지도",
    short_name: "한입지도",
    description: "둘이서 모은 맛집을 지도에 기록하고, 다음 한 입을 찾아보세요.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf9f6",
    theme_color: "#ff6b35",
    lang: "ko",
    orientation: "portrait",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/icon1", sizes: "192x192", type: "image/png" },
      { src: "/icon2", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
