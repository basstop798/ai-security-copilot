import { formatDA } from "@/lib/format";
import { lowestPrice } from "@/lib/psplus";
import { STORE } from "@/lib/store";
import { MESSAGES, waLink } from "@/lib/whatsapp";
import { ArrowRightIcon, GamepadIcon, HeartIcon, MapPinIcon, WhatsAppIcon } from "./icons";
import { OpenStatus } from "./OpenStatus";
import { ButtonLink } from "./ui";

export function Hero() {
  const from = lowestPrice();

  return (
    <section id="top" className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 size-[34rem] rounded-full bg-accent/20 blur-[120px]" />
        <div className="absolute top-10 -right-40 size-[38rem] rounded-full bg-ps/25 blur-[130px]" />
        <div className="hero-grid absolute inset-0" />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-16 sm:px-6 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:pb-24">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1.5 text-sm font-medium text-[#ffb3b8]">
            <HeartIcon size={15} className="text-accent-bright" />
            {STORE.tagline}
          </p>

          <h1 className="mt-6 font-display text-[2.6rem] leading-[1.04] font-bold tracking-tight text-balance text-ink sm:text-6xl">
            Consoles, jeux et accessoires{" "}
            <span className="bg-linear-to-r from-accent-bright via-[#ff6b8a] to-ps-bright bg-clip-text text-transparent">
              à Blida
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-muted">
            Vente, achat, échange et réparation de jeux vidéo. PS5, PS4, Xbox
            Series, Nintendo Switch, manettes, casques et abonnements PS Plus.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={waLink(MESSAGES.general)} external size="lg">
              <WhatsAppIcon size={20} />
              Commander sur WhatsApp
            </ButtonLink>
            <ButtonLink href="#produits" variant="ghost" size="lg">
              Voir les produits
              <ArrowRightIcon size={18} />
            </ButtonLink>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-muted">
            <OpenStatus />
            <a
              href={STORE.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full px-1 py-1.5 hover:text-ink"
            >
              <MapPinIcon size={16} className="text-accent-bright" />
              {STORE.address.street}, {STORE.address.city}
            </a>
          </div>
        </div>

        <div aria-hidden="true" className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-white/10 bg-linear-to-br from-navy-800 via-navy-900 to-navy-950 shadow-2xl shadow-ps/10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(10,110,224,0.38),transparent_62%)]" />
            <div className="absolute inset-[12%] rounded-full border border-ps/25" />
            <div className="absolute inset-[23%] rounded-full border border-accent/30" />
            <div className="absolute inset-[34%] rounded-full border border-white/10" />
            <div className="absolute inset-0 grid place-items-center">
              <GamepadIcon
                size={180}
                strokeWidth={0.9}
                className="w-2/5 text-ink drop-shadow-[0_0_30px_rgba(78,163,255,0.55)]"
              />
            </div>
          </div>

          {from != null ? (
            <div className="absolute bottom-8 left-3 rounded-2xl border border-white/10 bg-navy-850/90 px-4 py-3 shadow-xl backdrop-blur sm:-left-6">
              <p className="text-xs font-semibold tracking-wider text-ps-bright uppercase">
                PS Plus
              </p>
              <p className="font-display text-xl font-bold text-ink">
                dès {formatDA(from)}
              </p>
            </div>
          ) : null}

          <div className="absolute top-8 right-3 rounded-2xl border border-white/10 bg-navy-850/90 px-4 py-3 shadow-xl backdrop-blur sm:-right-6">
            <p className="text-xs font-semibold tracking-wider text-accent-bright uppercase">
              Ouvert 7j/7
            </p>
            <p className="font-display text-xl font-bold text-ink">jusqu&apos;à 23h30</p>
          </div>

          <div className="absolute right-6 bottom-[-1rem] hidden rounded-full border border-white/10 bg-navy-850/90 px-4 py-2 text-sm text-muted shadow-xl backdrop-blur sm:block">
            {STORE.services.join(" · ")}
          </div>
        </div>
      </div>
    </section>
  );
}
