import { formatDA } from "./format";
import { STORE } from "./store";

export function waLink(message?: string): string {
  const base = `https://wa.me/${STORE.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

const HELLO = `Bonjour ${STORE.name},`;

export const MESSAGES = {
  general: `${HELLO} j'ai une question.`,

  product: (name: string, condition: string) =>
    `${HELLO} je suis intéressé(e) par : ${name} (${condition.toLowerCase()}). Est-il disponible, et à quel prix ?`,

  psPlus: (plan: string, duration: string, price: number | null) =>
    price != null
      ? `${HELLO} je souhaite commander un abonnement PS Plus ${plan} ${duration} (${formatDA(price)}). Est-il disponible ?`
      : `${HELLO} je souhaite un abonnement PS Plus ${plan} ${duration}. Quel est le prix ?`,

  sell: [
    `${HELLO} je veux vendre ma console.`,
    "Modèle :",
    "État :",
    "Accessoires inclus :",
    "Je vous envoie des photos.",
  ].join("\n"),

  exchange: [
    `${HELLO} je voudrais faire un échange.`,
    "Ce que j'ai :",
    "Ce que je cherche :",
  ].join("\n"),

  repair: [
    `${HELLO} j'ai besoin d'une réparation.`,
    "Appareil :",
    "Problème :",
  ].join("\n"),
};
