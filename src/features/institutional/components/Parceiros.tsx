"use client";

const parceiros = [
  { nome: "AZUL", tipo: "Linhas Aéreas · Parceira exclusiva", featured: true },
  { nome: "Parceiro 2", tipo: "Categoria" },
  { nome: "Parceiro 3", tipo: "Categoria" },
  { nome: "Parceiro 4", tipo: "Categoria" },
  { nome: "Parceiro 5", tipo: "Categoria" },
];

export function Parceiros() {
  return (
    <div className="bg-dark2 px-6 md:px-12 py-10 border-y border-cream/10">
      <div className="flex flex-col items-center gap-6">
        <div className="eyebrow">Parceiros e apoiadores institucionais</div>
        <div className="flex items-center gap-4 md:gap-6 flex-wrap justify-center">
          {parceiros.map((p, i) => (
            <div
              key={i}
              className="border border-cream/10 hover:border-cream/30 transition-colors px-6 py-3 rounded-[2px] flex flex-col items-center"
            >
              <div
                className={`serif tracking-[0.1em] ${p.featured ? "text-cream/80 text-lg" : "text-cream/45 text-sm"}`}
              >
                {p.nome}
              </div>
              <div className="text-[7px] tracking-[0.2em] uppercase text-cream/30 mt-0.5 font-light">
                {p.tipo}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
