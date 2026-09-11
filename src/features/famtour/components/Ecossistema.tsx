"use client";

const frentes = [
  { num: "Vertente 01", name: "Feira", desc: "Maior feira nupcial do Nordeste" },
  { num: "Vertente 02", name: "Destinos", desc: "Famtours imersivos em destinos premium" },
  { num: "Vertente 03", name: "Guia", desc: "Publicação editorial de referência" },
  { num: "Vertente 04", name: "Workshop", desc: "Encontro estratégico para o mercado premium" },
];

export function Ecossistema() {
  return (
    <section
      id="ecossistema"
      className="relative overflow-hidden bg-green text-cream px-6 md:px-12 py-20 md:py-28"
    >
      <div className="absolute -top-20 -right-20 w-[400px] h-[400px] border border-cream/[0.06] rounded-full pointer-events-none">
        <div className="absolute inset-12 border border-cream/[0.04] rounded-full" />
      </div>
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-14 items-center">
        <div>
          <div className="eyebrow mb-3">Sobre o grupo</div>
          <h2 className="sec-title text-cream mb-5">
            O ecossistema
            <br />
            <em>New Wed.</em>
          </h2>
          <p className="text-cream/65 text-[13px] leading-[1.85] font-light mb-5">
            O Grupo New Wed é onde reunimos as parcerias mais estratégicas e o "ouro" do mercado de casamentos no Nordeste. Da Feira Tendência às Famtours, cada projeto foi costurado para simplificar o bicho de sete cabeças que é o Destination Wedding.
          </p>
          <p className="text-cream/65 text-[13px] leading-[1.85] font-light mb-7">
            Somos um ecossistema de autoridade e curadoria para quem quer dominar os destinos com segurança e propriedade real — uma plataforma de conexões para conectar sonhos a destinos inesquecíveis.
          </p>
          <a href="/sobre" className="btn btn-outline-light">Conhecer o grupo</a>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {frentes.map((f, i) => (
            <div
              key={i}
              className="border border-cream/[0.12] hover:border-cream/25 transition-colors p-4 md:p-5 rounded-[2px]"
            >
              <div className="text-[8px] tracking-[0.25em] uppercase text-cream/35 mb-1.5 font-light">
                {f.num}
              </div>
              <div className="serif text-cream text-lg md:text-xl mb-1">{f.name}</div>
              <div className="text-[10px] text-cream/45 leading-snug font-light">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
