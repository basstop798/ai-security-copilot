import { STORE } from "@/lib/store";
import { MESSAGES, waLink } from "@/lib/whatsapp";
import { ClockIcon, FacebookIcon, InstagramIcon, MapPinIcon, PhoneIcon, ThreadsIcon, WhatsAppIcon } from "./icons";
import { HoursTable, OpenStatus } from "./OpenStatus";
import { ButtonLink, SectionHeading } from "./ui";

export const SOCIAL_LINKS = [
  { ...STORE.socials.instagram, label: "Instagram", icon: InstagramIcon },
  { ...STORE.socials.facebook, label: "Facebook", icon: FacebookIcon },
  { ...STORE.socials.threads, label: "Threads", icon: ThreadsIcon },
];

export function Visit() {
  return (
    <section id="contact" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
      <SectionHeading eyebrow="Contact" title="Passez nous voir à Blida">
        Ouvert tous les jours. Une question avant de venir ? Écrivez-nous sur
        WhatsApp.
      </SectionHeading>

      <div className="mt-12 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="grid gap-5">
          <div className="rounded-2xl border border-white/[0.07] bg-navy-850 p-6">
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent-bright ring-1 ring-accent/30">
                <MapPinIcon size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-lg font-semibold text-ink">Adresse</h3>
                <address className="mt-1 text-muted not-italic">
                  {STORE.address.street}
                  <br />
                  {STORE.address.city}, Algérie
                </address>
                <a
                  href={STORE.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm font-semibold text-ps-bright hover:underline"
                >
                  Itinéraire sur Google Maps
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-navy-850 p-6">
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-ps/10 text-ps-bright ring-1 ring-ps/30">
                <ClockIcon size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-display text-lg font-semibold text-ink">Horaires</h3>
                  <OpenStatus className="text-xs" />
                </div>
                <div className="mt-2">
                  <HoursTable />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-navy-850 p-6">
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-wa/10 text-wa ring-1 ring-wa/30">
                <PhoneIcon size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-lg font-semibold text-ink">Téléphone et WhatsApp</h3>
                <a href={`tel:${STORE.phoneE164}`} className="mt-1 block font-display text-xl font-semibold tracking-wide text-ink tabular-nums hover:text-ps-bright">
                  {STORE.phoneDisplay}
                </a>
                <div className="mt-4 flex flex-wrap gap-2">
                  <ButtonLink href={waLink(MESSAGES.general)} external size="sm">
                    <WhatsAppIcon size={15} />
                    WhatsApp
                  </ButtonLink>
                  <ButtonLink href={`tel:${STORE.phoneE164}`} variant="ghost" size="sm">
                    <PhoneIcon size={15} />
                    Appeler
                  </ButtonLink>
                </div>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {SOCIAL_LINKS.map((s) => (
                    <li key={s.label}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-sm text-muted hover:border-white/25 hover:text-ink"
                      >
                        <s.icon size={15} />
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="relative min-h-[22rem] overflow-hidden rounded-2xl border border-white/[0.07] bg-navy-850">
          {/* Shown until the map loads, or if it is blocked. */}
          <div className="absolute inset-0 grid place-items-center p-6 text-center">
            <div>
              <MapPinIcon size={36} className="mx-auto text-accent-bright" />
              <p className="mt-3 font-display text-lg font-semibold text-ink">{STORE.mapsName}</p>
              <a href={STORE.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm font-semibold text-ps-bright hover:underline">
                Ouvrir dans Google Maps
              </a>
            </div>
          </div>
          <iframe
            title={`Carte : ${STORE.name}, ${STORE.address.city}`}
            src={STORE.mapsEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
      </div>
    </section>
  );
}
