import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FwdLink - Professional Freight Quotes",
    short_name: "FwdLink",
    description:
      "Stop using Excel. Send professional freight quotes via WhatsApp/Email link in 30 seconds.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#1e3a8a",
    orientation: "portrait",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
    categories: ["business", "productivity", "logistics"],
  };
}
