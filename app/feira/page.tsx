import { WHATSAPP_URL } from "@/features/institutional/contact";
import { SiteShell } from "@/features/institutional/components/SiteShell";
import { VerticalHero } from "@/features/institutional/components/VerticalHero";
import { Section } from "@/features/institutional/components/Section";
import { CtaBlock } from "@/features/institutional/components/CtaBlock";
import feiraImgAsset from "@/assets/feira.jpg";
const feiraImg = feiraImgAsset.src;

export default function Page() {
  return (
    <SiteShell>
      <VerticalHero
        eyebrow="New Wed Feira · Tendência · Desde 2016"
        title={
          <>
            A feira que move
            <br />
            o mercado de casamentos
            <br />
            <em className="text-cream/55 italic">do Nordeste.</em>
          </>
        }
        description="Reunimos noivos qualificados, fornecedores premium e marcas-destino em um ambiente único de relacionamento e negócios."
        image={feiraImg}
        accent="oklch(0.36 0.12 15 / 0.55)"
        ctaPrimary={{ label: "Quero visitar", href: "#contato" }}
        ctaSecondary={{ label: "Quero expor", href: "#contato" }}
      />

      {/* Para quem é */}
      <Section variant="cream">
        <div className="max-w-3xl">
          <div className="eyebrow-dark mb-2">Para quem é a feira</div>
          <h2 className="sec-title text-dark">
            Três públicos.
            <br />
            <em>Um só ponto de encontro.</em>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[
            {
              n: "01",
              t: "Noivos",
              d: "Encontre fornecedores e inspirações para o seu grande dia em um ambiente curado.",
            },
            {
              n: "02",
              t: "Fornecedores",
              d: "Apresente sua marca para um público qualificado, fechado e pronto para contratar.",
            },
            {
              n: "03",
              t: "Marcas & Destinos",
              d: "Posicione sua marca e conecte-se com novos parceiros estratégicos do mercado.",
            },
          ].map((p) => (
            <div key={p.n} className="border-t border-dark/15 pt-5">
              <div className="text-[8px] tracking-[0.3em] uppercase text-dark/40 mb-3 font-light">
                Público {p.n}
              </div>
              <div className="serif text-dark text-2xl mb-3">{p.t}</div>
              <p className="text-dark/55 text-[12px] leading-[1.8] font-light">{p.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Stats */}
      <div className="bg-bord text-cream px-6 md:px-12 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto text-center">
          {[
            { n: "2016", l: "Desde" },
            { n: "+5 mil", l: "Visitantes" },
            { n: "+100", l: "Expositores" },
            { n: "+8 mi", l: "Em contratos" },
          ].map((s, i) => (
            <div
              key={i}
              className={i > 0 ? "md:border-l border-cream/15 md:pl-6" : ""}
            >
              <div className="serif text-cream text-4xl md:text-5xl font-light">{s.n}</div>
              <div className="text-[8px] tracking-[0.3em] uppercase text-cream/55 mt-2 font-light">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>

      <CtaBlock
        eyebrow="Próxima edição"
        title={
          <>
            Reserve seu espaço
            <br />
            <em>na próxima feira.</em>
          </>
        }
        description="Faça parte do principal movimento do mercado de casamentos do Nordeste."
        primary={{ label: "Quero expor", href: WHATSAPP_URL }}
        secondary={{ label: "Quero visitar", href: WHATSAPP_URL }}
      />
    </SiteShell>
  );
}
