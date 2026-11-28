import type { Metadata } from "next";
import "./globals.css";
import "./site.css";
import "./extras.css";

export const metadata: Metadata = {
  title: "Pintura360 — Pintura Profissional na Grande Lisboa",
  description:
    "Pintamos. Cuidamos. Cumprimos. Serviço completo de pintura na Grande Lisboa, do orçamento à limpeza final. Peça já o seu orçamento grátis.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-PT">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
