import { WHATSAPP_URL } from "@/features/institutional/contact";
import { SiteShell } from "@/features/institutional/components/SiteShell";
import { VerticalHero } from "@/features/institutional/components/VerticalHero";
import { Section } from "@/features/institutional/components/Section";
import { CtaBlock } from "@/features/institutional/components/CtaBlock";
import workshopImgAsset from "@/assets/workshop.jpg";
const workshopImg = workshopImgAsset.src;

const pillars = [
  { t: "Conteúdo estratégico", d: "Aulas e debates conduzidos por referências do mercado." },
  { t: "Experiências gastronômicas", d: "Jantar autoral e degustações com curadoria New Wed." },
  { t: "Networking qualificado", d: "Convidados selecionados para gerar negócio real." },
  { t: "Ativação de marca", d: "Sua marca presente na experiência completa." },
];

const formatos = [
  { t: "Essencial", d: "Sua marca presente no evento." },
  { t: "Experiência", d: "Degustação + vídeo institucional." },
  { t: "Presença Plus", d: "Exposição + degustação + vídeo." },
  { t: "Brand Experience", d: "Experiência completa e exclusiva." },
];

export default function Page() {
  return (
    <SiteShell>
      <VerticalHero
        eyebrow="New Wed Workshop · Encontro estratégico"
        title={
          <>
            Conexão e posicionamento
            <br />
            para marcas
            <br />
            <em className="text-cream/55 italic">do mercado premium.</em>
          </>
        }
        description="Um encontro curado para conectar destinos, fornecedores e profissionais que decidem o mercado de casamentos de luxo."
        image={workshopImg}
        accent="oklch(0.32 0.08 320 / 0.55)"
        ctaPrimary={{ label: "Quero participar", href: "#contato" }}
        ctaSecondary={{ label: "Ver combos", href: "#formatos" }}
      />

      {/* Experiência única */}
      <Section variant="cream">
        <div className="text-center max-w-2xl mx-auto">
          <div className="eyebrow-dark mb-2">Uma experiência única</div>
          <h2 className="sec-title text-dark">
            Quatro pilares,
            <br />
            <em>uma só noite.</em>
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-5xl mx-auto">
          {pillars.map((p) => (
            <div key={p.t} className="text-center">
              <div className="w-14 h-14 rounded-full border border-dark/15 mx-auto mb-5 flex items-center justify-center">
                <span className="serif text-dark/45 text-sm">✦</span>
              </div>
              <div className="serif text-dark text-lg mb-2">{p.t}</div>
              <div className="text-[10px] text-dark/55 font-light leading-snug">{p.d}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Combos */}
      <Section variant="dark" id="formatos">
        <div className="max-w-3xl">
          <div className="eyebrow mb-2">Formatos de participação</div>
          <h2 className="sec-title text-cream">
            Quatro combos.
            <br />
            <em>Quatro níveis de presença.</em>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-12">
          {formatos.map((f, i) => (
            <div
              key={f.t}
              className="bg-bord/90 hover:bg-bord transition-colors p-7 rounded-[3px]"
            >
              <div className="text-[8px] tracking-[0.3em] uppercase text-cream/55 mb-4 font-light">
                Combo {String(i + 1).padStart(2, "0")}
              </div>
              <div className="serif text-cream text-2xl mb-3">{f.t}</div>
              <div className="text-[11px] text-cream/65 font-light leading-snug">{f.d}</div>
            </div>
          ))}
        </div>
      </Section>

      <CtaBlock
        eyebrow="Próxima edição"
        title={
          <>
            Garanta sua presença
            <br />
            <em>no próximo Workshop.</em>
          </>
        }
        description="Vagas limitadas para marcas e profissionais."
        primary={{ label: "Quero participar", href: WHATSAPP_URL }}
        secondary={{ label: "Ver combos", href: WHATSAPP_URL }}
      />
    </SiteShell>
  );
}
