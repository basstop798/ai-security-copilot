import { MESSAGES, waLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./icons";

export function WhatsAppFab() {
  return (
    <a
      href={waLink(MESSAGES.general)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Écrire à Sony Game sur WhatsApp"
      className="fixed right-4 bottom-4 z-50 grid size-14 place-items-center rounded-full bg-wa text-navy-950 shadow-xl shadow-black/40 ring-4 ring-navy-950/60 transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:hover:scale-100 sm:right-6 sm:bottom-6"
    >
      <WhatsAppIcon size={28} />
    </a>
  );
}
