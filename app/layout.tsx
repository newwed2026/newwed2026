import type { Metadata } from "next";
import "./globals.css";
import "./institutional-home.css";

export const metadata: Metadata = {
  title: "Grupo New Wed · Destination Wedding no Nordeste",
  description:
    "O ecossistema completo de Destination Wedding no Nordeste: Famtours, Feira Tendência, Workshop, Destinos e Projeto Azul.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
