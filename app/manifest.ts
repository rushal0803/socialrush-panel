import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SocialRUSH",
    short_name: "SocialRUSH",
    description: "Social media growth services, secure ordering and campaign tracking.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#07080D",
    theme_color: "#07080D",
    orientation: "portrait-primary",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
