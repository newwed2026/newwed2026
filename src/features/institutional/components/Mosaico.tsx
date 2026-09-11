"use client";

import fantourImgAsset from "@/assets/fantour-noronha.jpg";
const fantourImg = fantourImgAsset.src;
import feiraImgAsset from "@/assets/feira.jpg";
const feiraImg = feiraImgAsset.src;
import workshopImgAsset from "@/assets/workshop.jpg";
const workshopImg = workshopImgAsset.src;
import azulImgAsset from "@/assets/azul.jpg";
const azulImg = azulImgAsset.src;

function Cell({
  img,
  label,
  caption,
  className = "",
}: {
  img: string;
  label: string;
  caption: string;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-[3px] ${className}`}>
      <img src={img} alt={caption} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to top, oklch(0.14 0.012 40 / 0.9) 0%, oklch(0.14 0.012 40 / 0.1) 60%)",
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="text-[8px] tracking-[0.2em] uppercase text-cream/50 mb-1 font-light">{label}</div>
        <div className="serif text-cream text-base md:text-lg leading-tight">{caption}</div>
      </div>
    </div>
  );
}

export function Mosaico() {
  return (
    <section id="destinos" className="bg-cream text-dark px-6 md:px-12 py-20 md:py-28">
      <div className="text-center">
        <div className="eyebrow-dark">Prova social</div>
        <h2 className="sec-title text-dark mt-3">
          Quem vive,
          <br />
          <em>vende com autoridade.</em>
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-[200px_200px] gap-1.5 mt-10 md:auto-rows-[220px]">
        <div className="md:row-span-2 md:h-auto h-[300px]">
          <Cell
            img={fantourImg}
            label="Famtour · Noronha"
            caption="Vivência real em destino premium"
            className="h-full"
          />
        </div>
        <Cell img={feiraImg} label="Feira Tendência" caption="Maior feira nupcial do NE" className="h-full" />
        <Cell img={workshopImg} label="Workshop" caption="Capacitação profissional" className="h-full" />
        <div className="bg-dark2 flex items-center justify-center p-6 rounded-[3px] h-full">
          <div className="text-center">
            <p className="serif italic text-cream/75 text-sm md:text-base leading-snug">
              "Voltei fechando contratos que antes eu perdia. A Famtour mudou como eu vendo Destination."
            </p>
            <div className="text-[8px] tracking-[0.2em] uppercase text-cream/35 mt-3 font-light">
              — Assessora · Recife · Famtour Noronha 2024
            </div>
          </div>
        </div>
        <Cell img={azulImg} label="Projeto Azul" caption="Experiência exclusiva de voo" className="h-full" />
      </div>
    </section>
  );
}
