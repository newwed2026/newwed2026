"use client";

import Link from "next/link";
import {
  WHATSAPP_URL,
  EMAIL,
  INSTAGRAM_FEIRA_URL,
  INSTAGRAM_GUIA_URL,
  INSTAGRAM_DESTINOS_URL,
  INSTAGRAM_WORKSHOP_URL,
  CITY,
} from "@/features/famtour/contact";

const vertentes = [
  { to: "/#feira" as const, label: "Feira" },
  { to: "/#destinos" as const, label: "Destinos" },
  { to: "/#guia" as const, label: "Guia" },
  { to: "/#workshop" as const, label: "Workshop" },
];
const institucional = [
  { to: "/#sobre" as const, label: "Sobre o grupo" },
  { to: "/#contato" as const, label: "Contato" },
];

export function Footer() {
  return (
    <footer className="bg-dark border-t border-cream/10">
      <div className="px-6 md:px-12 py-14 md:py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <div className="serif text-cream text-xl tracking-[0.18em]">
            NEW WED
          </div>
          <p className="text-[11px] text-cream/45 leading-[1.7] mt-4 font-light max-w-[220px]">
            O maior ecossistema de conexões para o mercado de casamento no
            Nordeste. Curadoria e autoridade desde 2014.
          </p>
          <div className="text-[9px] tracking-[0.2em] uppercase text-cream/35 mt-5 font-light">
            {CITY}
          </div>
        </div>

        <div>
          <div className="text-[8px] tracking-[0.3em] uppercase text-cream/40 mb-4 font-light">
            Vertentes
          </div>
          <ul className="flex flex-col gap-2.5 text-[11px] text-cream/55 font-light">
            {vertentes.map((l) => (
              <li key={l.to}>
                <Link href={l.to} className="hover:text-cream transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-[8px] tracking-[0.3em] uppercase text-cream/40 mb-4 font-light">
            Institucional
          </div>
          <ul className="flex flex-col gap-2.5 text-[11px] text-cream/55 font-light">
            {institucional.map((l) => (
              <li key={l.to}>
                <Link href={l.to} className="hover:text-cream transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-[8px] tracking-[0.3em] uppercase text-cream/40 mb-4 font-light">
            Contato
          </div>
          <ul className="flex flex-col gap-2.5 text-[11px] text-cream/55 font-light">
            <li>
              <a
                href={WHATSAPP_URL}
                className="hover:text-cream transition-colors"
              >
                WhatsApp
              </a>
            </li>
            <li>
              <a
                href={`mailto:${EMAIL}`}
                className="hover:text-cream transition-colors break-all"
              >
                {EMAIL}
              </a>
            </li>
            <li>
              <a
                href={INSTAGRAM_FEIRA_URL}
                className="hover:text-cream transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                @new_wed_feira
              </a>
            </li>
            <li>
              <a
                href={INSTAGRAM_GUIA_URL}
                className="hover:text-cream transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                @new_wed_guianordeste
              </a>
            </li>
            <li>
              <a
                href={INSTAGRAM_DESTINOS_URL}
                className="hover:text-cream transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                @new_wed_destinos
              </a>
            </li>
            <li>
              <a
                href={INSTAGRAM_WORKSHOP_URL}
                className="hover:text-cream transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                @new_wed_workshop
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10 px-6 md:px-12 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-[8px] tracking-[0.2em] uppercase text-cream/30 font-light">
        <div>© 2027 · Grupo New Wed · Todos os direitos reservados</div>
        <div className="flex gap-5">
          <Link href="/#sobre" className="hover:text-cream/60 transition-colors">
            Sobre
          </Link>
          <Link href="/#contato" className="hover:text-cream/60 transition-colors">
            Contato
          </Link>
        </div>
      </div>
    </footer>
  );
}
