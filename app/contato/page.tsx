"use client";

import { useState } from "react";
import { SiteShell } from "@/features/institutional/components/SiteShell";
import { WHATSAPP_URL, EMAIL, mailtoLink } from "@/features/institutional/contact";

const perfis = [
  { id: "assessor", label: "Sou assessor / profissional" },
  { id: "noiva", label: "Sou noiva / noivo" },
  { id: "fornecedor", label: "Sou fornecedor" },
  { id: "marca", label: "Sou marca / destino" },
];

export default function Page() {
  const [perfil, setPerfil] = useState("assessor");
  const [nome, setNome] = useState("");
  const [contato, setContato] = useState("");
  const [msg, setMsg] = useState("");

  const subject = `Contato pelo site · ${perfis.find((p) => p.id === perfil)?.label ?? ""}`;
  const body = `Nome: ${nome}\nContato: ${contato}\n\n${msg}`;
  const mail = mailtoLink(subject, body);
  const wa = `${WHATSAPP_URL}?text=${encodeURIComponent(`Olá, sou ${nome}. ${msg}`)}`;

  return (
    <SiteShell>
      <section className="relative pt-32 pb-20 md:pb-28 px-6 md:px-12 bg-dark text-cream">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20">
          <div>
            <div className="eyebrow mb-3">Contato</div>
            <h1 className="serif text-cream font-normal leading-[1.05] text-[clamp(36px,4.5vw,56px)]">
              Conte para nós
              <br />
              <em className="text-cream/55 italic">o que você precisa.</em>
            </h1>
            <p className="text-smoke text-[13px] leading-[1.8] font-light mt-6 max-w-md">
              Respondemos em até 1 dia útil. Para urgências, prefira o WhatsApp.
            </p>

            <div className="mt-10 space-y-5 text-[12px] text-cream/65 font-light">
              <div>
                <div className="text-[8px] tracking-[0.3em] uppercase text-cream/40 mb-1.5">WhatsApp</div>
                <a href={WHATSAPP_URL} className="hover:text-cream transition-colors">Falar agora</a>
              </div>
              <div>
                <div className="text-[8px] tracking-[0.3em] uppercase text-cream/40 mb-1.5">E-mail</div>
                <a href={`mailto:${EMAIL}`} className="hover:text-cream transition-colors break-all">{EMAIL}</a>
              </div>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = mail;
            }}
            className="bg-dark2 border border-cream/10 rounded-[3px] p-6 md:p-8 space-y-5"
          >
            <div>
              <label className="text-[8px] tracking-[0.3em] uppercase text-cream/40 font-light block mb-2">
                Você é
              </label>
              <div className="grid grid-cols-2 gap-2">
                {perfis.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPerfil(p.id)}
                    className={`text-[10px] tracking-[0.15em] uppercase font-light py-2.5 px-3 rounded-[2px] border transition-colors text-left ${
                      perfil === p.id
                        ? "border-cream text-cream bg-cream/5"
                        : "border-cream/15 text-cream/55 hover:border-cream/35"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[8px] tracking-[0.3em] uppercase text-cream/40 font-light block mb-2">Nome</label>
              <input
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full bg-transparent border border-cream/15 focus:border-cream/40 outline-none text-cream text-[13px] py-3 px-4 rounded-[2px] font-light transition-colors"
              />
            </div>

            <div>
              <label className="text-[8px] tracking-[0.3em] uppercase text-cream/40 font-light block mb-2">E-mail ou WhatsApp</label>
              <input
                required
                value={contato}
                onChange={(e) => setContato(e.target.value)}
                className="w-full bg-transparent border border-cream/15 focus:border-cream/40 outline-none text-cream text-[13px] py-3 px-4 rounded-[2px] font-light transition-colors"
              />
            </div>

            <div>
              <label className="text-[8px] tracking-[0.3em] uppercase text-cream/40 font-light block mb-2">Mensagem</label>
              <textarea
                required
                rows={4}
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                className="w-full bg-transparent border border-cream/15 focus:border-cream/40 outline-none text-cream text-[13px] py-3 px-4 rounded-[2px] font-light transition-colors resize-none"
              />
            </div>

            <div className="flex gap-3 flex-wrap pt-2">
              <button type="submit" className="btn btn-solid">Enviar por e-mail</button>
              <a
                href={wa}
                onClick={(e) => {
                  if (!nome || !msg) {
                    e.preventDefault();
                    alert("Preencha nome e mensagem antes.");
                  }
                }}
                className="btn btn-outline-light"
              >
                Enviar por WhatsApp
              </a>
            </div>
          </form>
        </div>
      </section>
    </SiteShell>
  );
}
