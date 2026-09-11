"use client";

import type { ReactNode } from "react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { WhatsAppFloat } from "./WhatsAppFloat";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-dark text-cream min-h-screen">
      <Nav />
      {children}
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
