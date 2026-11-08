import Image from "next/image";
import { INSTAGRAM_TILES, STORE } from "@/lib/store";
import { CATEGORY_ICONS, InstagramIcon } from "./icons";
import { ButtonLink } from "./ui";

const TILE_BG = [
  "from-ps/45 via-navy-800 to-navy-900",
  "from-accent/45 via-navy-800 to-navy-900",
  "from-[#7b4fe0]/40 via-navy-800 to-navy-900",
  "from-accent/35 via-navy-800 to-ps/30",
  "from-ps/35 via-navy-800 to-accent/25",
  "from-[#1f8fb3]/40 via-navy-800 to-navy-900",
];

export function Instagram() {
  const ig = STORE.socials.instagram;

  return (
    <section id="instagram" className="border-t border-white/[0.06] bg-navy-900/60">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-full bg-linear-to-tr from-accent-bright to-ps-bright p-[3px]">
              <span className="grid size-full place-items-center rounded-full border-[3px] border-navy-900 bg-navy-850 font-display text-lg font-extrabold text-ink">
                SG
              </span>
            </span>
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-accent-bright uppercase">Instagram</p>
              <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">{ig.handle}</h2>
              <p className="text-sm text-muted">Arrivages, offres et nouveautés, chaque semaine.</p>
            </div>
          </div>
          <ButtonLink href={ig.url} external variant="ghost">
            <InstagramIcon size={18} />
            Nous suivre
          </ButtonLink>
        </div>

        <ul className="mt-10 grid grid-cols-3 gap-1.5 sm:gap-3 lg:grid-cols-6">
          {INSTAGRAM_TILES.map((tile, i) => {
            const Icon = CATEGORY_ICONS[tile.category];
            return (
              <li key={tile.label}>
                <a
                  href={ig.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${tile.label}, voir sur Instagram (nouvel onglet)`}
                  className="group relative block aspect-square overflow-hidden rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ps-bright sm:rounded-2xl"
                >
                  {tile.image ? (
                    <Image src={tile.image} alt="" fill className="object-cover" sizes="(min-width:1024px) 180px, 33vw" />
                  ) : (
                    <div className={`absolute inset-0 grid place-items-center bg-linear-to-br ${TILE_BG[i % TILE_BG.length]}`}>
                      <div aria-hidden="true" className="card-dots absolute inset-0 opacity-30" />
                      <Icon size={64} strokeWidth={1} className="relative w-1/3 text-ink/80" />
                    </div>
                  )}
                  <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-navy-950/90 to-transparent p-2 text-[0.7rem] font-semibold text-ink sm:p-3 sm:text-sm">
                    {tile.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 grid place-items-center bg-navy-950/60 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-white">
                      <InstagramIcon size={22} />
                      <span className="hidden sm:inline">Voir sur Instagram</span>
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
