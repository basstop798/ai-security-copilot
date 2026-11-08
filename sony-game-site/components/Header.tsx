"use client";

import { useState } from "react";
import { MESSAGES, waLink } from "@/lib/whatsapp";
import { CloseIcon, MenuIcon, WhatsAppIcon } from "./icons";
import { ButtonLink, Wordmark } from "./ui";

const NAV = [
  { href: "#produits", label: "Produits" },
  { href: "#ps-plus", label: "PS Plus" },
  { href: "#vendre", label: "Vendre / Échanger" },
  { href: "#instagram", label: "Instagram" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-navy-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" aria-label="Sony Game, retour en haut" className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ps-bright">
          <Wordmark />
        </a>

        <nav aria-label="Navigation principale" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="rounded-full px-3.5 py-2 text-sm font-medium text-muted transition hover:bg-white/5 hover:text-ink"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ButtonLink href={waLink(MESSAGES.general)} external size="sm" className="hidden sm:inline-flex">
            <WhatsAppIcon size={16} />
            WhatsApp
          </ButtonLink>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full border border-white/10 text-ink md:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>
      </div>

      {open ? (
        <nav id="menu-mobile" aria-label="Navigation mobile" className="border-t border-white/[0.06] md:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col px-4 py-3">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-3 font-medium text-ink hover:bg-white/5"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <ButtonLink href={waLink(MESSAGES.general)} external className="w-full">
                <WhatsAppIcon size={18} />
                Écrire sur WhatsApp
              </ButtonLink>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
