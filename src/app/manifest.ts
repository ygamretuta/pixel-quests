import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pixel Quests",
    short_name: "Quests",
    description: "Defeat monsters by finishing real-life quests",
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#1b1b3a",
    theme_color: "#1b1b3a",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
