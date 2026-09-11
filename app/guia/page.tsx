import { WHATSAPP_URL } from "@/features/institutional/contact";
import { SiteShell } from "@/features/institutional/components/SiteShell";
import { VerticalHero } from "@/features/institutional/components/VerticalHero";
import { Section } from "@/features/institutional/components/Section";
import { CtaBlock } from "@/features/institutional/components/CtaBlock";
import guiaImgAsset from "@/assets/guia.jpg";
const guiaImg = guiaImgAsset.src;

const formatos = [
  { t: "Página simples", d: "Presença essencial" },
  { t: "Página dupla", d: "Narrativa expandida" },
  { t: "Matéria especial", d: "História editorial" },
  { t: "Capa", d: "Posicionamento máximo" },
  { t: "Combo Impresso + Digital", d: "Cobertura completa" },
];

export default function Page() {
  return (
    <SiteShell>
      <VerticalHero
        eyebrow="New Wed Guia · Editorial · Nordeste"
        title={
          <>
            A publicação que
            <br />
            posiciona destinos
            <br />
            <em className="text-cream/55 italic">e histórias de amor.</em>
          </>
        }
        description="Conteúdo exclusivo, distribuição estratégica e extensão digital. O Guia New Wed é a referência impressa do Destination Wedding no Nordeste."
        image={guiaImg}
        accent="oklch(0.45 0.10 60 / 0.55)"
        ctaPrimary={{ label: "Quero anunciar", href: "#contato" }}
        ctaSecondary={{ label: "Ver mídia kit", href: "#formatos" }}
      />

      {/* Pilares */}
      <Section variant="cream">
        <div className="max-w-3xl">
          <div className="eyebrow-dark mb-2">O que entregamos</div>
          <h2 className="sec-title text-dark">
            Conteúdo, distribuição
            <br />
            <em>e extensão digital.</em>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-12">
          {[
            {
              t: "Conteúdo exclusivo",
              d: "Destinos, fornecedores, histórias e tendências do mercado nupcial premium.",
            },
            {
              t: "Distribuição estratégica",
              d: "Pernambuco, São Paulo, Minas Gerais, Brasília e principais eventos do setor.",
            },
            {
              t: "Extensão digital",
              d: "Instagram, YouTube, entrevistas e muito mais conteúdo amplificando sua marca.",
            },
          ].map((p) => (
            <div
              key={p.t}
              className="border border-dark/12 hover:border-dark/30 transition-colors p-7 rounded-[3px]"
            >
              <div className="serif text-dark text-2xl mb-3">{p.t}</div>
              <p className="text-dark/55 text-[12px] leading-[1.8] font-light">{p.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Formatos */}
      <Section variant="dark2" id="formatos">
        <div className="text-center max-w-2xl mx-auto">
          <div className="eyebrow mb-2">Formatos comerciais</div>
          <h2 className="sec-title text-cream">
            Escolha como sua marca
            <br />
            <em>vai aparecer.</em>
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-12 max-w-5xl mx-auto">
          {formatos.map((f, i) => (
            <div
              key={f.t}
              className="border border-cream/12 hover:border-cream/30 transition-colors p-5 rounded-[3px] text-center"
            >
              <div className="text-[8px] tracking-[0.3em] uppercase text-cream/40 mb-3 font-light">
                Formato {String(i + 1).padStart(2, "0")}
              </div>
              <div className="serif text-cream text-lg leading-tight mb-1.5">{f.t}</div>
              <div className="text-[10px] text-cream/45 font-light">{f.d}</div>
            </div>
          ))}
        </div>
      </Section>

      <CtaBlock
        eyebrow="Mídia kit"
        title={
          <>
            Posicione sua marca
            <br />
            <em>na próxima edição.</em>
          </>
        }
        description="Receba o mídia kit completo com formatos, datas e investimento."
        primary={{ label: "Solicitar mídia kit", href: WHATSAPP_URL }}
        secondary={{ label: "Falar com a equipe", href: "/contato" }}
      />
    </SiteShell>
  );
}
