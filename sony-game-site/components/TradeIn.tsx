import { MESSAGES, waLink } from "@/lib/whatsapp";
import { ArrowRightIcon, BanknoteIcon, RepeatIcon, WhatsAppIcon, WrenchIcon } from "./icons";
import { ButtonLink, SectionHeading } from "./ui";

const SERVICES = [
  {
    icon: BanknoteIcon,
    title: "Vendre",
    text: "Une console, des manettes ou des jeux qui ne servent plus ? Envoyez-nous des photos, on vous fait une offre.",
    cta: "Vendre",
    message: MESSAGES.sell,
    accent: "text-accent-bright bg-accent/10 ring-accent/30",
  },
  {
    icon: RepeatIcon,
    title: "Échanger",
    text: "Échangez votre ancienne console ou vos jeux contre un autre article de la boutique.",
    cta: "Proposer un échange",
    message: MESSAGES.exchange,
    accent: "text-ps-bright bg-ps/10 ring-ps/30",
  },
  {
    icon: WrenchIcon,
    title: "Réparer",
    text: "Console, manette ou accessoire en panne ? Décrivez le problème, on vous dit ce qu'on peut faire.",
    cta: "Demander une réparation",
    message: MESSAGES.repair,
    accent: "text-[#ffd27a] bg-[#ffd27a]/10 ring-[#ffd27a]/30",
  },
];

const STEPS = [
  "Envoyez le modèle et quelques photos sur WhatsApp.",
  "Recevez notre estimation.",
  "Passez en boutique à Blida pour finaliser.",
];

export function TradeIn() {
  return (
    <section id="vendre" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
      <SectionHeading eyebrow="Services" title="Vendre · Échanger · Réparer">
        Achat, échange et réparation de consoles et d&apos;accessoires, en
        boutique à Blida.
      </SectionHeading>

      <ul className="mt-12 grid gap-4 md:grid-cols-3">
        {SERVICES.map((s) => (
          <li key={s.title} className="flex flex-col rounded-2xl border border-white/[0.07] bg-navy-850 p-6">
            <span className={`grid size-12 place-items-center rounded-xl ring-1 ${s.accent}`}>
              <s.icon size={24} />
            </span>
            <h3 className="mt-5 font-display text-xl font-bold text-ink">{s.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{s.text}</p>
            <a
              href={waLink(s.message)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-ps-bright"
            >
              {s.cta}
              <ArrowRightIcon size={16} />
            </a>
          </li>
        ))}
      </ul>

      <div className="relative mt-6 overflow-hidden rounded-3xl border border-accent/25 bg-linear-to-br from-accent/20 via-navy-850 to-ps/20 p-6 sm:p-10">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <h3 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              Comment ça marche ?
            </h3>
            <ol className="mt-6 grid gap-4 sm:grid-cols-3">
              {STEPS.map((step, i) => (
                <li key={step} className="flex gap-3 text-sm text-ink/90">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/10 font-display font-bold text-ink">
                    {i + 1}
                  </span>
                  <span className="pt-1.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <ButtonLink href={waLink(MESSAGES.sell)} external size="lg" className="w-full sm:w-auto">
            <WhatsAppIcon size={20} />
            Je veux vendre ma console
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
