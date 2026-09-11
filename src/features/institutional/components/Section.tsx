"use client";

import type { ReactNode } from "react";

export function Section({
  id,
  variant = "dark",
  children,
  className = "",
}: {
  id?: string;
  variant?: "dark" | "dark2" | "cream" | "bord";
  children: ReactNode;
  className?: string;
}) {
  const tone = {
    dark: "bg-dark text-cream",
    dark2: "bg-dark2 text-cream",
    cream: "bg-cream text-dark",
    bord: "bg-bord text-cream",
  }[variant];
  return (
    <section id={id} className={`${tone} px-6 md:px-12 py-20 md:py-28 ${className}`}>
      {children}
    </section>
  );
}
