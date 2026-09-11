// Contato centralizado — atualize aqui quando tiver os dados reais.
export const WHATSAPP_NUMBER = "5581973273996";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const EMAIL = "marketing@newwed.com.br";
export const INSTAGRAM_FEIRA_URL = "https://www.instagram.com/new_wed_feira/";
export const INSTAGRAM_GUIA_URL =
  "https://www.instagram.com/new_wed_guianordeste/";
export const INSTAGRAM_DESTINOS_URL =
  "https://www.instagram.com/new_wed_destinos/";
export const INSTAGRAM_WORKSHOP_URL =
  "https://www.instagram.com/new_wed_workshop/";
export const CITY = "Recife · Pernambuco";

export const waLink = (msg?: string) =>
  msg ? `${WHATSAPP_URL}?text=${encodeURIComponent(msg)}` : WHATSAPP_URL;

export const mailtoLink = (subject: string, body?: string) =>
  `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}${
    body ? `&body=${encodeURIComponent(body)}` : ""
  }`;
