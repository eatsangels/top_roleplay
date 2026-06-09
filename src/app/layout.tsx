import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "TOP ROLEPLAY",
  category: "games",
  title: {
    default: "TOP ROLEPLAY - Cops vs Gangs: Guerra de Territorios",
    template: "%s · TOP ROLEPLAY",
  },
  description:
    "TOP ROLEPLAY es una ciudad viva de policías, bandas y civiles donde territorios, reputación y decisiones construyen cada historia.",
  keywords: [
    "TOP ROLEPLAY",
    "MMORPG server",
    "cops vs gangs",
    "police roleplay",
    "gang roleplay",
    "territory wars",
    "wanted system",
    "Tales of Pirates server",
    "roleplay server",
    "gaming community",
    "servidor roleplay policías y bandas",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TOP ROLEPLAY - Cops vs Gangs",
    description:
      "Entra a una ciudad viva donde policías, bandas y civiles disputan territorios, reputación y operaciones cada semana.",
    url: "/",
    siteName: "TOP ROLEPLAY",
    locale: "es_ES",
    type: "website",
    // og:image is provided by the file-based convention app/opengraph-image.tsx
    // (a real 1200x630 PNG that social crawlers render).
  },
  twitter: {
    card: "summary_large_image",
    title: "TOP ROLEPLAY - Cops vs Gangs",
    description: "Policías, bandas y civiles cambian el control de la ciudad en TOP ROLEPLAY.",
    // twitter:image falls back to app/opengraph-image.tsx as well.
  },
  icons: {
    icon: "/TOP_ROLEPLAY_traced_real.svg",
    apple: "/TOP_ROLEPLAY_traced_real.svg",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "TOP ROLEPLAY",
      url: siteUrl,
      logo: `${siteUrl}/TOP_ROLEPLAY_traced_real.svg`,
      description:
        "Comunidad y servidor de rol Cops vs Gangs: Guerra de Territorios para Tales of Pirates.",
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "TOP ROLEPLAY",
      inLanguage: "es",
      publisher: { "@id": `${siteUrl}/#organization` },
      description:
        "TOP ROLEPLAY es una ciudad viva de policías, bandas y civiles donde territorios, reputación y decisiones construyen cada historia.",
    },
    {
      "@type": "VideoGame",
      "@id": `${siteUrl}/#game`,
      name: "Cops vs Gangs: Guerra de Territorios",
      url: siteUrl,
      inLanguage: "es",
      gamePlatform: "PC",
      applicationCategory: "Game",
      genre: ["MMORPG", "Roleplay"],
      publisher: { "@id": `${siteUrl}/#organization` },
      description:
        "Mod de rol por facciones para Tales of Pirates (PKO): policías, bandas y civiles disputan territorios, reputación y operaciones.",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${cinzel.variable} h-full scroll-smooth antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
