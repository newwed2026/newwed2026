import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-dark text-cream px-6">
      <div className="max-w-md text-center">
        <div className="text-[10px] tracking-[0.3em] uppercase text-cream/40 font-light">Erro 404</div>
        <h1 className="serif text-cream text-5xl md:text-6xl font-light mt-4">Página não encontrada.</h1>
        <p className="text-cream/55 text-[13px] font-light mt-4 leading-[1.8]">
          Esse caminho não existe — ou ainda não foi construído.
        </p>
        <div className="mt-8 flex gap-3 justify-center flex-wrap">
          <Link href="/" className="btn btn-solid">Voltar ao início</Link>
          <Link href="/contato" className="btn btn-outline-light">Falar com a equipe</Link>
        </div>
      </div>
    </div>
  );
}
