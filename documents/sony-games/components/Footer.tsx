import { STORE } from "@/lib/store";
import { SOCIAL_LINKS } from "./Visit";
import { Wordmark } from "./ui";

const LINKS = [
  { href: "#produits", label: "Produits" },
  { href: "#ps-plus", label: "Abonnements PS Plus" },
  { href: "#vendre", label: "Vendre / Échanger / Réparer" },
  { href: "#contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-navy-950">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Wordmark />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
            Boutique de jeux vidéo à Blida : vente, achat, échange et réparation.
            {" "}{STORE.tagline}.
          </p>
        </div>

        <nav aria-label="Liens du pied de page">
          <h2 className="text-xs font-bold tracking-[0.2em] text-muted uppercase">Boutique</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-ink/85 hover:text-ink">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-bold tracking-[0.2em] text-muted uppercase">Nous suivre</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {SOCIAL_LINKS.map((s) => (
              <li key={s.label}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-ink/85 hover:text-ink">
                  <s.icon size={16} />
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl space-y-1.5 px-4 py-6 text-xs leading-relaxed text-muted sm:px-6">
          <p>
            © {new Date().getFullYear()} {STORE.name}, {STORE.address.city}.
            Boutique indépendante, non affiliée à Sony Interactive Entertainment,
            Microsoft ou Nintendo.
          </p>
          <p>PlayStation, Xbox and Nintendo are trademarks of their respective owners.</p>
        </div>
      </div>
    </footer>
  );
}
