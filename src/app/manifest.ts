import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TOP ROLEPLAY - Cops vs Gangs: Guerra de Territorios",
    short_name: "TOP ROLEPLAY",
    description:
      "Comunidad y servidor de rol Cops vs Gangs: Guerra de Territorios. Policías, bandas y civiles disputan territorios, reputación y operaciones.",
    lang: "es",
    start_url: "/",
    display: "standalone",
    background_color: "#05060a",
    theme_color: "#05060a",
    icons: [
      {
        src: "/TOP_ROLEPLAY_traced_real.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
