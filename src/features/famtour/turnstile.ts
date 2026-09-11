"use client";

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement,options:Record<string,unknown>) => string;
      execute: (widgetId:string) => void;
      remove: (widgetId:string) => void;
    };
  }
}

let scriptPromise: Promise<void> | undefined;

function loadScript() {
  if (window.turnstile) return Promise.resolve();
  if (!scriptPromise) scriptPromise = new Promise((resolve,reject) => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Não foi possível carregar a verificação de segurança."));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export async function getTurnstileToken(): Promise<string | undefined> {
  const config = await fetch("/api/public/config").then((response) => response.json()) as { turnstileSiteKey?: string };
  if (!config.turnstileSiteKey) return undefined;
  await loadScript();
  return new Promise<string>((resolve,reject) => {
    const element = document.createElement("div");
    Object.assign(element.style,{ position:"fixed",left:"-9999px",top:"0",width:"1px",height:"1px",overflow:"hidden" });
    document.body.appendChild(element);
    let widgetId = "";
    const cleanup = () => { if (widgetId) window.turnstile?.remove(widgetId); element.remove(); };
    widgetId = window.turnstile!.render(element,{
      sitekey:config.turnstileSiteKey,
      size:"invisible",
      execution:"execute",
      callback:(token:string) => { cleanup();resolve(token); },
      "error-callback":() => { cleanup();reject(new Error("Falha na verificação de segurança.")); },
      "expired-callback":() => { cleanup();reject(new Error("A verificação expirou. Tente novamente.")); },
    });
    window.turnstile!.execute(widgetId);
  });
}
