"use client";

import heroImgAsset from "@/assets/hero-noronha.jpg";
const heroImg = heroImgAsset.src;

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex flex-col justify-end px-6 md:px-12 pb-16 pt-32 overflow-hidden"
    >
      <div
        className="absolute inset-0 animate-slow-zoom"
        style={{
          backgroundImage: `url(${heroImg})`,
          backgroundSize: "cover",
          backgroundPosition: "right center",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(to right, oklch(0.14 0.012 40 / 0.92) 0%, oklch(0.14 0.012 40 / 0.55) 45%, oklch(0.14 0.012 40 / 0.15) 100%),
            linear-gradient(to top, oklch(0.14 0.012 40 / 0.85) 0%, oklch(0.14 0.012 40 / 0.2) 60%, oklch(0.14 0.012 40 / 0.5) 100%),
            radial-gradient(ellipse 60% 70% at 15% 50%, oklch(0.36 0.12 15 / 0.35) 0%, transparent 70%)
          `,
        }}
      />
      {/* Decorative rings */}
      <svg
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.06] pointer-events-none"
        viewBox="0 0 600 600"
        fill="none"
      >
        <circle cx="300" cy="300" r="290" stroke="white" strokeWidth="0.5" />
        <circle cx="300" cy="300" r="210" stroke="white" strokeWidth="0.5" />
        <circle cx="300" cy="300" r="130" stroke="white" strokeWidth="0.5" />
        <circle cx="300" cy="300" r="4" fill="white" opacity="0.3" />
      </svg>

      <div className="relative z-10 max-w-2xl animate-fade-up">
        <div className="eyebrow mb-3">Grupo New Wed · Destination Wedding · Nordeste</div>
        <h1 className="serif text-cream font-normal leading-[1.02] my-4 text-[clamp(42px,6vw,76px)]">
          O ecossistema completo
          <br />
          do Destination Wedding
          <br />
          no <em className="italic text-cream/55">Nordeste.</em>
        </h1>
        <p className="text-smoke text-[13px] leading-[1.7] mb-8 max-w-md font-light">
          Feira · Destinos · Guia · Workshop
        </p>
        <div className="flex gap-3 flex-wrap">
          <a href="#famtours" className="btn btn-solid">Conhecer os projetos</a>
          <a href="#contato" className="btn btn-outline-light">Falar com a equipe</a>
        </div>
      </div>

      <div className="absolute bottom-7 right-12 z-10 hidden md:flex flex-col items-center gap-2 text-[8px] tracking-[0.3em] uppercase text-cream/25">
        scroll
        <span className="w-px h-10 bg-cream/25" />
      </div>
    </section>
  );
}
