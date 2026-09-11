// Contato centralizado — atualize aqui quando tiver os dados reais.
export const WHATSAPP_NUMBER = "5581973273996";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const EMAIL = "contato@gruponewwed.com.br";
export const INSTAGRAM_URL = "https://www.instagram.com/new_wed/";
export const INSTAGRAM_DESTINOS_URL = "https://www.instagram.com/new_wed_destinos/";
export const CITY = "Recife · Pernambuco";

export const waLink = (msg?: string) =>
  msg ? `${WHATSAPP_URL}?text=${encodeURIComponent(msg)}` : WHATSAPP_URL;

export const mailtoLink = (subject: string, body?: string) =>
  `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}${
    body ? `&body=${encodeURIComponent(body)}` : ""
  }`;
