"use client";

/**
 * PhotoMarquee — esteira horizontal infinita de fotos
 *
 * Para trocar as imagens, edite o array MARQUEE_IMAGES abaixo.
 * Coloque os arquivos .webp na pasta /public e aponte os caminhos aqui.
 *
 * A faixa é duplicada automaticamente para garantir o loop contínuo.
 */

// ─── ARRAY DE IMAGENS — edite aqui ────────────────────────────────────────
const MARQUEE_IMAGES: string[] = [
  "/Captura de tela 2026-05-20 165010.webp",
  "/CHEGANDO NO SUESTE.webp",
  "/DDL_3481.webp",
  "/DDL_6762.webp",
  "/IMG_8573.webp",
  "/LE040391.webp",
  "/LE048412.webp",
  "/LE048829.webp",
];
// ──────────────────────────────────────────────────────────────────────────

/**
 * Largura de cada foto (em px). Ajuste conforme o aspect-ratio das suas fotos.
 * Fotos verticais (portrait) ficam bem com 260–320px.
 * Fotos horizontais (landscape) ficam bem com 380–480px.
 */
const PHOTO_W = 380;

/** Duração de uma volta completa (em segundos). Aumente para mais lento. */
const SPEED_S = 40;

export function PhotoMarquee() {
  // Duplica a lista para criar o loop seamless
  const strip = [...MARQUEE_IMAGES, ...MARQUEE_IMAGES];
  // totalW = largura exata do set original (sem gap, coladas)
  const totalW = MARQUEE_IMAGES.length * PHOTO_W;

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        // height: 100% garante que ocupa toda a seção pai
        height: "100%",
        width: "100%",
      }}
    >
      {/* Faixa animada — ocupa 100% da altura do container */}
      <div
        style={{
          display: "flex",
          gap: 0,           // ← sem gap: fotos coladas lado a lado
          height: "100%",  // ← preenche 100% da seção verticalmente
          animation: `marquee-scroll ${SPEED_S}s linear infinite`,
          willChange: "transform",
        }}
      >
        {strip.map((src, i) => (
          <div
            key={`${src}-${i}`}
            style={{
              width: PHOTO_W,
              height: "100%",        // ← cada foto estica até a altura total
              flexShrink: 0,
              backgroundImage: `url('${src}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: 0,       // ← sem borda arredondada
            }}
          />
        ))}
      </div>

      {/* Keyframes — deslocamento = largura exata do set original */}
      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-${totalW}px); }
        }
      `}</style>
    </div>
  );
}

