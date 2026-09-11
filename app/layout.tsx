import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grupo New Wed · Destination Wedding no Nordeste",
  description:
    "O ecossistema completo de Destination Wedding no Nordeste: Famtours, Feira Tendência, Workshop, Destinos e Projeto Azul.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Anton&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=DM+Sans:wght@200;300;400;500;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
