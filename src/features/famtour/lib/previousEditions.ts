import noronhaCoverAsset from "@/assets/fantour-noronha.jpg";
const noronhaCover = noronhaCoverAsset.src;
import rioGrandeDoNorteCoverAsset from "@/assets/dest-rn.jpg";
const rioGrandeDoNorteCover = rioGrandeDoNorteCoverAsset.src;
import alagoasCoverAsset from "@/assets/dest-milagres.jpg";
const alagoasCover = alagoasCoverAsset.src;

export type PreviousEditionMedia =
  | {
      type: "image";
      src: string;
      alt: string;
    }
  | {
      type: "video";
      src: string;
      title: string;
      poster?: string;
    };

export type PreviousEdition = {
  slug: string;
  destino: string;
  ano: number;
  capa: string;
  capaAlt: string;
  galeria: readonly PreviousEditionMedia[];
};

export const PREVIOUS_EDITIONS = [
  {
    slug: "fernando-de-noronha-2026",
    destino: "Fernando de Noronha",
    ano: 2026,
    capa: noronhaCover,
    capaAlt: "Edição anterior em Fernando de Noronha",
    galeria: [
      {
        type: "image",
        src: noronhaCover,
        alt: "Edição anterior em Fernando de Noronha",
      },
    ],
  },
  {
    slug: "rio-grande-do-norte-2026",
    destino: "Rio Grande do Norte",
    ano: 2026,
    capa: rioGrandeDoNorteCover,
    capaAlt: "Edição anterior no Rio Grande do Norte",
    galeria: [
      {
        type: "image",
        src: rioGrandeDoNorteCover,
        alt: "Edição anterior no Rio Grande do Norte",
      },
    ],
  },
  {
    slug: "alagoas-2026",
    destino: "Alagoas",
    ano: 2026,
    capa: alagoasCover,
    capaAlt: "Edição anterior em Alagoas",
    galeria: [
      {
        type: "image",
        src: alagoasCover,
        alt: "Edição anterior em Alagoas",
      },
    ],
  },
] as const satisfies readonly PreviousEdition[];

export function getPreviousEditionBySlug(slug: string) {
  return PREVIOUS_EDITIONS.find((edition) => edition.slug === slug);
}
