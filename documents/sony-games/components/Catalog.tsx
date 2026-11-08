"use client";

import Image from "next/image";
import { useState } from "react";
import { formatDA } from "@/lib/format";
import { CATEGORIES, PRODUCTS, type CategoryId, type Product } from "@/lib/store";
import { MESSAGES, waLink } from "@/lib/whatsapp";
import { CATEGORY_ICONS, CrownIcon, WhatsAppIcon } from "./icons";
import { ButtonLink, SectionHeading } from "./ui";

type Filter = "all" | CategoryId;

const TINTS: Record<CategoryId, string> = {
  ps5: "from-ps/40 via-ps/10",
  ps4: "from-[#3b4fd8]/40 via-[#3b4fd8]/10",
  xbox: "from-[#1f8fb3]/35 via-[#1f8fb3]/10",
  switch: "from-accent/40 via-accent/10",
  manettes: "from-ps/35 via-accent/10",
  casques: "from-accent/35 via-ps/10",
  jeux: "from-[#7b4fe0]/35 via-[#7b4fe0]/10",
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Catalog() {
  const [filter, setFilter] = useState<Filter>("all");
  const visible = filter === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter);

  function pickFromHighlights(id: CategoryId) {
    setFilter(id);
    document.getElementById("produits")?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }

  return (
    <>
      {/* Story-highlight style category row */}
      <section aria-label="Catégories" className="border-y border-white/[0.06] bg-navy-900/60">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <ul className="no-scrollbar -mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:justify-center sm:gap-8 sm:px-0">
            {CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id];
              const active = filter === cat.id;
              return (
                <li key={cat.id} className="snap-start">
                  <button
                    type="button"
                    onClick={() => pickFromHighlights(cat.id)}
                    aria-pressed={active}
                    aria-label={`Voir les produits : ${cat.title}`}
                    className="group flex w-20 flex-col items-center gap-2.5 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ps-bright"
                  >
                    <Highlight active={active}>
                      <Icon size={30} strokeWidth={1.5} />
                    </Highlight>
                    <span className={`text-sm font-medium ${active ? "text-ink" : "text-muted group-hover:text-ink"}`}>
                      {cat.label}
                    </span>
                  </button>
                </li>
              );
            })}
            <li className="snap-start">
              <a
                href="#ps-plus"
                className="group flex w-20 flex-col items-center gap-2.5 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ps-bright"
              >
                <Highlight active={false}>
                  <CrownIcon size={30} strokeWidth={1.5} />
                </Highlight>
                <span className="text-sm font-medium text-muted group-hover:text-ink">PS Plus</span>
              </a>
            </li>
          </ul>
        </div>
      </section>

      <section id="produits" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading eyebrow="Nos produits" title="Consoles, manettes, casques et jeux">
            Neuf et occasion. Demandez la disponibilité et le prix sur WhatsApp,
            on vous répond rapidement.
          </SectionHeading>
          <p className="text-sm text-muted" aria-live="polite">
            {visible.length} article{visible.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filtrer par catégorie">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            Tout
          </FilterChip>
          {CATEGORIES.map((cat) => (
            <FilterChip key={cat.id} active={filter === cat.id} onClick={() => setFilter(cat.id)}>
              {cat.label}
            </FilterChip>
          ))}
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function Highlight({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`grid size-[4.5rem] place-items-center rounded-full p-[3px] transition ${
        active
          ? "bg-linear-to-tr from-accent-bright to-ps-bright"
          : "bg-linear-to-tr from-accent/70 to-ps/70 group-hover:from-accent-bright group-hover:to-ps-bright"
      }`}
    >
      <span
        className={`grid size-full place-items-center rounded-full border-[3px] border-navy-950 transition ${
          active ? "bg-navy-800 text-ink" : "bg-navy-850 text-ink/85"
        }`}
      >
        {children}
      </span>
    </span>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-9 shrink-0 rounded-full px-4 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ps-bright ${
        active
          ? "bg-ink text-navy-950"
          : "border border-white/10 text-muted hover:border-white/25 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function ProductCard({ product }: { product: Product }) {
  const Icon = CATEGORY_ICONS[product.category];
  const category = CATEGORIES.find((c) => c.id === product.category);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-navy-850 transition hover:-translate-y-0.5 hover:border-ps/40 hover:shadow-xl hover:shadow-ps/10 motion-reduce:hover:translate-y-0">
      <div className={`relative aspect-[4/3] bg-linear-to-br ${TINTS[product.category]} to-navy-900`}>
        {product.image ? (
          <Image src={product.image} alt={product.name} fill className="object-cover" sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" />
        ) : (
          <>
            <div aria-hidden="true" className="card-dots absolute inset-0 opacity-40" />
            <div className="absolute inset-0 grid place-items-center">
              <Icon size={88} strokeWidth={1} className="text-ink/85 drop-shadow-[0_0_24px_rgba(78,163,255,0.35)] transition group-hover:scale-105 motion-reduce:group-hover:scale-100" />
            </div>
          </>
        )}
        <span
          className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-semibold ${
            product.condition === "Neuf"
              ? "bg-ps/90 text-white"
              : "bg-navy-950/80 text-ink ring-1 ring-white/15"
          }`}
        >
          {product.condition}
        </span>
        <span className="absolute top-3 right-3 rounded-full bg-navy-950/60 px-2.5 py-1 text-xs font-medium text-muted backdrop-blur">
          {category?.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-lg leading-snug font-semibold text-ink">{product.name}</h3>
        <p className="mt-1 text-sm text-muted">{product.detail}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <p className="leading-tight">
            <span className="block text-xs text-muted">Prix</span>
            <span className="font-display font-bold whitespace-nowrap text-ink">
              {product.price != null ? formatDA(product.price) : "Sur demande"}
            </span>
          </p>
          <ButtonLink
            href={waLink(MESSAGES.product(product.name, product.condition))}
            external
            size="sm"
            aria-label={`Commander ${product.name} sur WhatsApp`}
          >
            <WhatsAppIcon size={15} />
            Commander
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
