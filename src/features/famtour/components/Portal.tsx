"use client";

import Link from "next/link";
import feiraImgAsset from "@/assets/feira.jpg";
const feiraImg = feiraImgAsset.src;
import destImgAsset from "@/assets/fantour-noronha.jpg";
const destImg = destImgAsset.src;
import guiaImgAsset from "@/assets/guia.jpg";
const guiaImg = guiaImgAsset.src;
import workshopImgAsset from "@/assets/workshop.jpg";
const workshopImg = workshopImgAsset.src;

type To = "/feira" | "/destinos" | "/guia" | "/workshop";

const verticals: Array<{
  to: To;
  num: string;
  brand: string;
  title: string;
  desc: string;
  img: string;
  accent: string;
}> = [
  {
    to: "/feira",
    num: "01",
    brand: "New Wed Feira",
    title: "Feira Tendência",
    desc: "A maior feira de noivas e destinos para casamentos do Nordeste.",
    img: feiraImg,
    accent: "oklch(0.36 0.12 15)",
  },
  {
    to: "/destinos",
    num: "02",
    brand: "New Wed Destinos",
    title: "Destination & Famtours",
    desc: "Imersão em destinos premium do Nordeste para profissionais do mercado.",
    img: destImg,
    accent: "oklch(0.30 0.045 165)",
  },
  {
    to: "/guia",
    num: "03",
    brand: "New Wed Guia",
    title: "Guia Editorial",
    desc: "Publicação de referência: destinos, fornecedores e bastidores do mercado.",
    img: guiaImg,
    accent: "oklch(0.45 0.10 60)",
  },
  {
    to: "/workshop",
    num: "04",
    brand: "New Wed Workshop",
    title: "Workshop",
    desc: "Capacitação para profissionais do mercado de casamentos de luxo.",
    img: workshopImg,
    accent: "oklch(0.32 0.08 320)",
  },
];

export function Portal() {
  return (
    <section id="vertentes" className="bg-cream text-dark px-6 md:px-12 py-20 md:py-28">
      <div className="max-w-3xl">
        <div className="eyebrow-dark mb-2">O ecossistema</div>
        <h2 className="sec-title text-dark">
          Quatro vertentes.
          <br />
          <em>Um único universo.</em>
        </h2>
        <p className="text-dark/55 text-[13px] leading-[1.85] font-light mt-5 max-w-xl">
          Cada bloco é uma porta de entrada para uma experiência completa da marca. Escolha por onde começar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-10 md:mt-14">
        {verticals.map((v) => (
          <Link
            key={v.to}
            href={v.to}
            className="group relative overflow-hidden rounded-[3px] min-h-[420px] md:min-h-[460px] flex flex-col justify-end transition-transform hover:-translate-y-1"
          >
            <img
              src={v.img}
              alt={v.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `
                  linear-gradient(to top, oklch(0.14 0.012 40 / 0.96) 0%, oklch(0.14 0.012 40 / 0.25) 55%, oklch(0.14 0.012 40 / 0.55) 100%),
                  linear-gradient(135deg, ${v.accent} 0%, transparent 55%)
                `,
                mixBlendMode: "normal",
              }}
            />
            <div className="absolute top-6 left-6 right-6 flex items-start justify-between z-10">
              <div className="text-[8px] tracking-[0.3em] uppercase text-cream/55 font-light">
                Vertente {v.num}
              </div>
              <div className="text-[8px] tracking-[0.3em] uppercase text-cream/55 font-light">
                {v.brand}
              </div>
            </div>
            <div className="relative z-10 p-6 md:p-8">
              <div className="serif text-cream text-3xl md:text-4xl leading-[1.05] font-normal mb-3">
                {v.title}
              </div>
              <p className="text-cream/65 text-[12px] leading-[1.7] font-light mb-6 max-w-md">
                {v.desc}
              </p>
              <span className="inline-flex items-center gap-2 text-[9px] tracking-[0.25em] uppercase text-cream border-b border-cream/40 pb-1 group-hover:border-cream transition-all">
                Entrar
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
