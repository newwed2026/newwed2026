"use client";

type Props = {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
};

export function CtaBlock({ eyebrow, title, description, primary, secondary }: Props) {
  return (
    <section id="contato" className="relative overflow-hidden bg-bord text-cream py-24 md:py-32 px-6 text-center">
      <svg
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.12] pointer-events-none"
        width="500"
        height="500"
        viewBox="0 0 500 500"
        fill="none"
      >
        <circle cx="250" cy="250" r="240" stroke="white" strokeWidth="0.5" />
        <circle cx="250" cy="250" r="180" stroke="white" strokeWidth="0.5" />
        <circle cx="250" cy="250" r="120" stroke="white" strokeWidth="0.5" />
        <circle cx="250" cy="250" r="60" stroke="white" strokeWidth="0.5" />
      </svg>
      <div className="relative z-10 max-w-3xl mx-auto">
        {eyebrow && <div className="eyebrow !text-cream/45 mb-4">{eyebrow}</div>}
        <h2 className="sec-title text-cream mb-3">{title}</h2>
        {description && (
          <p className="text-cream/70 text-[13px] font-light mb-8 mt-3">{description}</p>
        )}
        <div className="flex gap-3.5 justify-center flex-wrap">
          <a href={primary.href} className="btn btn-white">{primary.label}</a>
          {secondary && (
            <a href={secondary.href} className="btn btn-outline-light">{secondary.label}</a>
          )}
        </div>
      </div>
    </section>
  );
}
