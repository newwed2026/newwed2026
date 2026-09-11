"use client";

type Props = {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  image: string;
  accent: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
};

export function VerticalHero({
  eyebrow,
  title,
  description,
  image,
  accent,
  ctaPrimary,
  ctaSecondary,
}: Props) {
  return (
    <section className="relative min-h-screen flex flex-col justify-end px-6 md:px-12 pb-16 md:pb-20 pt-32 overflow-hidden">
      {/* Layer 1: blurred full-cover background — same image, blurred to create the soft edge effect */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(18px)",
          transform: "scale(1.08)", /* slightly scale up to hide blur edges */
        }}
      />
      {/* Layer 2: same image on top with object-fit: contain — subject is fully visible, no cropping */}
      <img
        src={image}
        alt=""
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 top-[4rem] w-full animate-slow-zoom"
        style={{ objectFit: "contain", objectPosition: "center top", height: "calc(100% - 4rem)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(to right, oklch(0.14 0.012 40 / 0.92) 0%, oklch(0.14 0.012 40 / 0.55) 45%, oklch(0.14 0.012 40 / 0.2) 100%),
            linear-gradient(to top, oklch(0.14 0.012 40 / 0.85) 0%, oklch(0.14 0.012 40 / 0.2) 60%, oklch(0.14 0.012 40 / 0.55) 100%),
            radial-gradient(ellipse 60% 70% at 15% 50%, ${accent} 0%, transparent 70%)
          `,
        }}
      />
      <div className="relative z-10 max-w-2xl animate-fade-up">
        <div className="eyebrow mb-4">{eyebrow}</div>
        <h1 className="serif text-cream font-normal leading-[1.02] my-4 text-[clamp(40px,5.5vw,70px)]">
          {title}
        </h1>
        <p className="text-smoke text-[13px] md:text-[14px] leading-[1.75] mb-8 max-w-lg font-light">
          {description}
        </p>
        <div className="flex gap-3 flex-wrap">
          <a href={ctaPrimary.href} className="btn btn-solid">{ctaPrimary.label}</a>
          {ctaSecondary && (
            <a href={ctaSecondary.href} className="btn btn-outline-light">{ctaSecondary.label}</a>
          )}
        </div>
      </div>
    </section>
  );
}
