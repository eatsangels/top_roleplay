import { ImageResponse } from "next/og";

// Dynamically generated social preview (real PNG, 1200x630) so Discord/X/Facebook
// render a link image. Avoids relying on an SVG asset, which social crawlers ignore.
export const runtime = "edge";
export const alt = "TOP ROLEPLAY - Cops vs Gangs: Guerra de Territorios";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#050505",
          backgroundImage:
            "radial-gradient(circle at 25% 20%, rgba(176,0,32,0.35), transparent 45%), radial-gradient(circle at 80% 80%, rgba(0,229,255,0.22), transparent 45%)",
          color: "#f5f5f5",
          fontFamily: "sans-serif",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 30,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#00e5ff",
            marginBottom: 24,
          }}
        >
          Servidor de Rol · Tales of Pirates
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 800,
            color: "#ffd700",
            lineHeight: 1.05,
            textAlign: "center",
            letterSpacing: 4,
          }}
        >
          TOP ROLEPLAY
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 44,
            fontWeight: 700,
            color: "#f5f5f5",
            marginTop: 16,
            textAlign: "center",
          }}
        >
          Cops vs Gangs: Guerra de Territorios
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#a3a3a3",
            marginTop: 36,
            maxWidth: 900,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Policías, bandas y civiles disputan territorios, reputación y operaciones cada semana.
        </div>
      </div>
    ),
    { ...size }
  );
}
