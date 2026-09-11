"use client";

import feiraImgAsset from "@/assets/feira.jpg";
const feiraImg = feiraImgAsset.src;
import workshopImgAsset from "@/assets/workshop.jpg";
const workshopImg = workshopImgAsset.src;
import pipaImgAsset from "@/assets/pipa.jpg";
const pipaImg = pipaImgAsset.src;

const cards = [
  {
    img: feiraImg,
    tag: "New Wed",
    title: ["Feira", "Tendência"],
    desc: "A maior feira de noivas e destinos para casamentos do Nordeste.",
    link: "Saiba mais",
  },
  {
    img: workshopImg,
    tag: "New Wed",
    title: ["New Wed", "Workshop"],
    desc: "Capacitação para profissionais do mercado de casamentos de luxo.",
    link: "Ver agenda",
  },
  {
    img: pipaImg,
    tag: "Famtour",
    title: ["Famtour Pipa", "+ Gostoso"],
    desc: "26 a 30 de julho · Dois destinos, uma experiência completa.",
    link: "Saber mais",
    badge: "Em breve",
  },
];

export function Produtos() {
  return (
    <section id="famtours" className="bg-cream text-dark px-6 md:px-12 py-20 md:py-28">
      <div className="eyebrow-dark mb-2">Nossos projetos</div>
      <h2 className="sec-title text-dark">
        Escolha onde
        <br />
        <em>você quer estar.</em>
      </h2>

      {/* Banner Famtour Noronha */}
      <div className="relative overflow-hidden rounded-[3px] mt-10 mb-3 px-7 md:px-10 py-7 md:py-9 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 50% 100% at 15% 50%, oklch(0.36 0.12 15 / 0.65) 0%, transparent 65%),
              radial-gradient(ellipse 40% 80% at 88% 50%, oklch(0.30 0.045 165 / 0.45) 0%, transparent 65%),
              oklch(0.10 0.012 40)
            `,
          }}
        />
        <div className="relative z-10">
          <span className="badge-pill mb-3">Vagas limitadas · Próxima data</span>
          <div className="eyebrow mt-3 mb-2">Famtour · Imersão para assessores</div>
          <h3 className="serif text-cream text-3xl md:text-4xl font-normal leading-none mb-2">
            Famtour Noronha
          </h3>
          <p className="text-smoke text-xs font-light">
            28 de junho a 02 de julho &nbsp;·&nbsp; R$ 7.500 &nbsp;·&nbsp; Domine a logística e os melhores contatos do destino
          </p>
        </div>
        <div className="relative z-10 flex flex-col gap-2 shrink-0">
          <a href="#contato" className="btn btn-solid">Garantir minha vaga</a>
          <a href="#contato" className="btn btn-outline-light !text-[9px]">Ver roteiro completo</a>
        </div>
      </div>

      {/* 3 cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {cards.map((c, i) => (
          <a
            key={i}
            href="#contato"
            className="group relative overflow-hidden rounded-[3px] min-h-[280px] flex flex-col justify-end transition-transform hover:-translate-y-1"
          >
            <img
              src={c.img}
              alt={c.title.join(" ")}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, oklch(0.14 0.012 40 / 0.92) 0%, oklch(0.14 0.012 40 / 0.15) 60%, oklch(0.14 0.012 40 / 0.4) 100%)",
              }}
            />
            {c.badge && (
              <span className="badge-pill absolute top-4 left-4 z-10">{c.badge}</span>
            )}
            <div className="relative z-10 p-5 md:p-6">
              <div className="text-[8px] tracking-[0.2em] uppercase text-cream/40 mb-1.5 font-light">{c.tag}</div>
              <div className="serif text-cream text-xl md:text-2xl leading-tight mb-2">
                {c.title[0]}
                <br />
                {c.title[1]}
              </div>
              <p className="text-cream/60 text-[10px] leading-relaxed mb-4 font-light">{c.desc}</p>
              <span className="text-[9px] tracking-[0.2em] uppercase text-cream/55 border-b border-cream/25 pb-1 group-hover:text-cream group-hover:border-cream transition-colors">
                {c.link}
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
