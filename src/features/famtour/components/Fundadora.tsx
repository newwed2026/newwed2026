"use client";

import cindyImgAsset from "@/assets/cindy.jpg";
const cindyImg = cindyImgAsset.src;

export function Fundadora() {
  return (
    <section id="sobre" className="bg-cream text-dark px-6 md:px-12 py-20 md:py-28">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-10 lg:gap-14 items-center">
        <div className="relative aspect-[3/4] overflow-hidden rounded-[3px] bg-dark">
          <img src={cindyImg} alt="Cindy Noel" loading="lazy" className="w-full h-full object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, oklch(0.14 0.012 40 / 0.7) 0%, transparent 55%)" }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="serif text-cream text-xl">Cindy Noel</div>
            <div className="text-[8px] tracking-[0.2em] uppercase text-cream/55 mt-1 font-light">
              Fundadora · Destination Wedding NE
            </div>
          </div>
        </div>

        <div>
          <div className="eyebrow-dark mb-3">A fundadora</div>
          <h2 className="sec-title text-dark mb-6">
            12 anos construindo
            <br />
            <em>o que ninguém</em>
            <br />
            <em>consegue copiar.</em>
          </h2>
          <blockquote className="serif italic text-dark text-xl md:text-2xl leading-[1.4] border-l-2 border-bord pl-5 mb-6">
            "Eu não vendo casamentos em destino.
            <br />
            <span className="text-bord">Eu sei como eles realmente funcionam."</span>
          </blockquote>
          <p className="text-dark/60 text-[13px] leading-[1.85] font-light mb-4">
            Cindy Noel passou 12 anos mapeando o que nenhum Google consegue ensinar: os hotéis que realmente atendem, os fornecedores que entregam, os destinos que funcionam e os que decepcionam. Essa curadoria virou um ecossistema.
          </p>
          <p className="text-dark/60 text-[13px] leading-[1.85] font-light mb-7">
            Criadora das Famtours e parceira estratégica da Azul Linhas Aéreas para fretamentos exclusivos — o Grupo New Wed nasceu da necessidade de transformar esse conhecimento em algo escalável e acessível para profissionais do segmento.
          </p>
          <a href="/sobre" className="btn btn-outline-dark">Conhecer a história completa</a>
        </div>
      </div>
    </section>
  );
}
