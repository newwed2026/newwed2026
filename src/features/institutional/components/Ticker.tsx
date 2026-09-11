"use client";

export function Ticker() {
  const items = [
    "Famtour Noronha · 28 Jun–02 Jul · R$ 7.500",
    "Famtour Pipa + Gostoso · 26–30 Jul",
    "Parceria exclusiva Azul Linhas Aéreas",
    "12 anos de Destination Wedding no Nordeste",
    "Vagas limitadas · Inscreva-se agora",
  ];
  const loop = [...items, ...items];
  return (
    <div className="bg-bord py-3 overflow-hidden whitespace-nowrap text-[9px] tracking-[0.3em] uppercase text-cream/70">
      <div className="inline-block animate-ticker">
        {loop.map((it, i) => (
          <span key={i}>
            {it}
            <span className="mx-7 opacity-40">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
