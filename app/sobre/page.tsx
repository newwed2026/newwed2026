import { SiteShell } from "@/features/institutional/components/SiteShell";
import { VerticalHero } from "@/features/institutional/components/VerticalHero";
import { Section } from "@/features/institutional/components/Section";
import { CtaBlock } from "@/features/institutional/components/CtaBlock";
import cindyImgAsset from "@/assets/cindy.jpg";
const cindyImg = cindyImgAsset.src;

export default function Page() {
  return (
    <SiteShell>
      <VerticalHero
        eyebrow="Sobre · Grupo New Wed"
        title={<>12 anos construindo<br /><em className="text-cream/55 italic">autoridade.</em></>}
        description="O Grupo New Wed nasceu da curadoria de Cindy Noel — 12 anos mapeando o que nenhum Google ensina sobre o Destination Wedding no Nordeste."
        image={cindyImg}
        accent="oklch(0.36 0.12 15 / 0.55)"
        ctaPrimary={{ label: "Falar com a equipe", href: "/contato" }}
        ctaSecondary={{ label: "Ver vertentes", href: "/#vertentes" }}
      />

      <Section variant="cream">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-10 lg:gap-14 items-start">
          <div>
            <div className="eyebrow-dark mb-2">A fundadora</div>
            <h2 className="sec-title text-dark">Cindy Noel.</h2>
            <p className="text-dark/55 text-[13px] leading-[1.85] font-light mt-5">
              Especialista em Destination Wedding no Nordeste, criadora das Famtours e parceira estratégica da Azul Linhas Aéreas para fretamentos exclusivos.
            </p>
          </div>
          <div className="space-y-5">
            <p className="text-dark/65 text-[13px] leading-[1.85] font-light">
              Em 12 anos de mercado, Cindy mapeou os hotéis que realmente atendem, os fornecedores que entregam, os destinos que funcionam — e os que decepcionam. Essa curadoria virou um ecossistema.
            </p>
            <p className="text-dark/65 text-[13px] leading-[1.85] font-light">
              O Grupo New Wed nasceu da necessidade de transformar esse conhecimento em algo escalável e acessível para profissionais do segmento — sem ruído, sem promessa vazia, com prova de mercado.
            </p>
            <blockquote className="serif italic text-bord text-xl leading-[1.4] border-l-2 border-bord pl-5 mt-6">
              "Eu não vendo casamentos em destino. Eu sei como eles realmente funcionam."
            </blockquote>
          </div>
        </div>
      </Section>

      <Section variant="dark2">
        <div className="max-w-3xl">
          <div className="eyebrow mb-2">Linha do tempo</div>
          <h2 className="sec-title text-cream">De assessoria<br /><em>a ecossistema.</em></h2>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-2">
          {[
            { ano: "2014", t: "Início", d: "Primeiros casamentos em destino no Nordeste." },
            { ano: "2016", t: "Feira", d: "Lançamento da New Wed Feira Tendência." },
            { ano: "2020", t: "Famtours", d: "Imersões para profissionais do mercado." },
            { ano: "2024", t: "Grupo", d: "Consolidação do ecossistema New Wed." },
          ].map((m) => (
            <div key={m.ano} className="border border-cream/12 p-5 rounded-[3px]">
              <div className="text-[8px] tracking-[0.3em] uppercase text-cream/40 mb-2 font-light">{m.ano}</div>
              <div className="serif text-cream text-xl mb-2">{m.t}</div>
              <div className="text-[11px] text-cream/55 font-light leading-snug">{m.d}</div>
            </div>
          ))}
        </div>
      </Section>

      <CtaBlock
        eyebrow="Próximo passo"
        title={<>Conheça o ecossistema<br /><em>por dentro.</em></>}
        description="Fale com nossa equipe ou explore as vertentes."
        primary={{ label: "Falar com a equipe", href: "/contato" }}
        secondary={{ label: "Ver vertentes", href: "/#vertentes" }}
      />
    </SiteShell>
  );
}
