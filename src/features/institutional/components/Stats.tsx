"use client";

const stats = [
  { num: "12", label: "Anos de mercado" },
  { num: "4", label: "Destinos premium" },
  { num: "Azul", label: "Parceria exclusiva" },
  { num: "54k", label: "Seguidores qualificados" },
  { num: "NE", label: "Especialidade regional" },
];

export function Stats() {
  return (
    <div className="bg-dark2 px-6 md:px-12 py-5 flex items-center border-b border-cream/10">
      {stats.map((s, i) => (
        <div
          key={i}
          className="flex-1 text-center py-3 relative"
          style={
            i > 0
              ? {
                  borderLeft: "0.5px solid oklch(0.965 0.012 70 / 0.1)",
                }
              : undefined
          }
        >
          <div className="serif text-cream font-light text-2xl md:text-3xl leading-none">{s.num}</div>
          <div className="text-[8px] tracking-[0.25em] uppercase text-cream/35 mt-1.5 font-light">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
