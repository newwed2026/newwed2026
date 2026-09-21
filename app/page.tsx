import { redirect } from "next/navigation";
import Link from "next/link";
import { Instagram } from "lucide-react";
import feiraImage from "@/assets/feira.jpg";
import destinosImage from "@/assets/fantour-noronha.jpg";
import guiaImage from "@/assets/guia.jpg";
import workshopImage from "@/assets/workshop.jpg";
import cindyImage from "@/assets/cindy.jpg";
import { INSTAGRAM_URL } from "@/features/institutional/contact";

const projects = [
  {
    href: "/feira",
    name: "Feira Tendência",
    brand: ["NEW", "WED", "FEIRA"],
    description: "A maior feira de tendências e destinos para casamentos do Nordeste.",
    image: feiraImage.src,
  },
  {
    href: "/destinos",
    name: "Destinos",
    brand: ["NEW", "WED", "DESTINOS"],
    description: "Famtours imersivos que apresentam destinos e criam conexões reais de negócios.",
    image: destinosImage.src,
  },
  {
    href: "/guia",
    name: "Guia",
    brand: ["NEW", "WED", "GUIA"],
    description: "Publicação de referência com fornecedores, destinos e conteúdo exclusivo.",
    image: guiaImage.src,
  },
  {
    href: "/workshop",
    name: "Workshop",
    brand: ["NEW", "WED", "WORKSHOP"],
    description: "Encontro estratégico que conecta destinos aos principais profissionais do país.",
    image: workshopImage.src,
  },
] as const;

const navigation = [
  { href: "/sobre", label: "O grupo" },
  { href: "/feira", label: "New Wed Feira" },
  { href: "/destinos", label: "New Wed Destinos" },
  { href: "/guia", label: "New Wed Guia" },
  { href: "/workshop", label: "New Wed Workshop" },
  { href: "/contato", label: "Contato" },
] as const;

function HomeContent() {
  return (
    <main className="nw-home">
      <section className="nw-hero" aria-labelledby="nw-hero-title">
        <header className="nw-header">
          <Link href="/" className="nw-logo" aria-label="Grupo New Wed, página inicial">
            <small>GRUPO</small>
            <span>NEW</span>
            <span>WED</span>
          </Link>
          <nav className="nw-nav" aria-label="Navegação principal">
            {navigation.map((item) => (
              <Link href={item.href} key={item.href}>{item.label}</Link>
            ))}
          </nav>
          <details className="nw-mobile-menu">
            <summary aria-label="Abrir menu"><span /><span /><span /></summary>
            <nav aria-label="Navegação principal mobile">
              {navigation.map((item) => (
                <Link href={item.href} key={item.href}>{item.label}</Link>
              ))}
            </nav>
          </details>
        </header>

        <div className="nw-hero-content">
          <h1 id="nw-hero-title">
            Conectamos<br />
            pessoas, destinos<br />
            e experiências
          </h1>
          <p>para celebrar o amor</p>
          <a className="nw-button nw-button-dark" href="#projetos">Conheça nossos projetos</a>
        </div>
      </section>

      <section className="nw-projects" id="projetos" aria-labelledby="nw-projects-title">
        <div className="nw-section-heading">
          <h2 id="nw-projects-title">Nosso ecossistema</h2>
          <p>Soluções completas para o mercado de casamentos</p>
        </div>
        <div className="nw-project-grid">
          {projects.map((project) => (
            <article className="nw-project-card" key={project.href}>
              <img src={project.image} alt="" loading="lazy" />
              <div className="nw-project-shade" />
              <div className="nw-project-copy">
                <h3 aria-label={`New Wed ${project.name}`}>
                  {project.brand.map((line) => <span key={line}>{line}</span>)}
                </h3>
                <div className="nw-project-bottom">
                  <p>{project.description}</p>
                  <Link href={project.href} className="nw-button nw-button-outline" aria-label={`Saiba mais sobre New Wed ${project.name}`}>
                    Saiba mais
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="nw-numbers" aria-label="O Grupo New Wed em números">
        <div className="nw-numbers-inner">
          <div className="nw-number nw-number-since"><span>Desde</span><strong>2016</strong></div>
          <div className="nw-number"><strong>+5 mil</strong><span>Visitantes<br />por edição</span></div>
          <div className="nw-number"><strong>+100</strong><span>Expositores</span></div>
          <div className="nw-number"><strong>+8 milhões</strong><span>Em contratos<br />movimentados</span></div>
        </div>
      </section>

      <section className="nw-story" aria-labelledby="nw-story-title">
        <div className="nw-story-image">
          <img src={cindyImage.src} alt="Cindy Noel, idealizadora do Grupo New Wed" loading="lazy" />
        </div>
        <div className="nw-story-copy">
          <div>
            <h2 id="nw-story-title">Por trás do New Wed</h2>
            <p>Idealizado por Cindy Noel, o Grupo New Wed une visão criativa, experiência em live marketing, atuação estratégica no mercado de casamentos, eventos e turismo no Nordeste.</p>
            <Link href="/sobre" className="nw-button nw-button-dark">Conheça nossa história</Link>
          </div>
        </div>
      </section>

      <section className="nw-closing" aria-labelledby="nw-closing-title">
        <span className="nw-quote-mark" aria-hidden="true">“</span>
        <div className="nw-closing-copy">
          <h2 id="nw-closing-title">Seja como for,<br />quem faz a festa é o amor.</h2>
          <Link href="/contato" className="nw-button nw-button-light-outline">Fale conosco</Link>
        </div>
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="nw-social" aria-label="Instagram do Grupo New Wed"><Instagram size={23} strokeWidth={1.5} /></a>
      </section>
      <footer className="nw-footer">
        <span>© 2026 Grupo New Wed</span>
        <span>Recife · Pernambuco</span>
      </footer>
    </main>
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  if (typeof query.edicao === "string") {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (typeof value === "string") params.set(key, value);
    }
    redirect(`/famtour?${params.toString()}`);
  }
  return <HomeContent />;
}
