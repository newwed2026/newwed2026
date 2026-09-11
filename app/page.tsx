import { redirect } from "next/navigation";
import { SiteShell } from "@/features/institutional/components/SiteShell";
import { Hero } from "@/features/institutional/components/Hero";
import { Ticker } from "@/features/institutional/components/Ticker";
import { Stats } from "@/features/institutional/components/Stats";
import { Portal } from "@/features/institutional/components/Portal";
import { Ecossistema } from "@/features/institutional/components/Ecossistema";
import { Fundadora } from "@/features/institutional/components/Fundadora";
import { Parceiros } from "@/features/institutional/components/Parceiros";
import { Mosaico } from "@/features/institutional/components/Mosaico";
import { Produtos } from "@/features/institutional/components/Produtos";
import { CtaFinal } from "@/features/institutional/components/CtaFinal";

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
  return (
    <SiteShell>
      <Hero />
      <Ticker />
      <Stats />
      <Portal />
      <Ecossistema />
      <Produtos />
      <Fundadora />
      <Parceiros />
      <Mosaico />
      <CtaFinal />
    </SiteShell>
  );
}
