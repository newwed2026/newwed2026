"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { to: "/feira" as const, label: "Feira" },
  { to: "/destinos" as const, label: "Destinos" },
  { to: "/guia" as const, label: "Guia" },
  { to: "/workshop" as const, label: "Workshop" },
  { to: "/sobre" as const, label: "Sobre" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-dark/80 border-b border-cream/10">
      <div className="flex items-center justify-between px-6 md:px-12 py-4">
        <Link
          href="/famtour"
          onClick={() => setOpen(false)}
          className="serif text-cream tracking-[0.18em] text-lg md:text-xl font-light"
        >
          NEW WED
        </Link>
        <div className="hidden md:flex gap-7 text-[10px] uppercase tracking-[0.2em] text-smoke font-light">
          {links.map((l) => (
            <Link
              key={l.to}
              href={l.to}
              className={`hover:text-cream transition-colors ${pathname === l.to ? "text-cream" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/contato" className="hidden md:inline-flex btn btn-solid !py-2 !px-4 text-[9px]">
            Falar com a equipe
          </Link>
          <button
            aria-label="Abrir menu"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 text-cream"
          >
            <span className={`block w-5 h-px bg-cream transition-transform ${open ? "translate-y-[3px] rotate-45" : ""}`} />
            <span className={`block w-5 h-px bg-cream transition-transform ${open ? "-translate-y-[3px] -rotate-45" : ""}`} />
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-cream/10 bg-dark/95 px-6 py-6 flex flex-col gap-5 text-[11px] uppercase tracking-[0.2em] text-smoke font-light">
          {links.map((l) => (
            <Link
              key={l.to}
              href={l.to}
              onClick={() => setOpen(false)}
              className={`hover:text-cream transition-colors ${pathname === l.to ? "text-cream" : ""}`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/contato"
            onClick={() => setOpen(false)}
            className="btn btn-solid !py-2 !px-4 text-[9px] self-start"
          >
            Falar com a equipe
          </Link>
        </div>
      )}
    </nav>
  );
}
