import { Catalog } from "@/components/Catalog";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Instagram } from "@/components/Instagram";
import { PsPlus } from "@/components/PsPlus";
import { TradeIn } from "@/components/TradeIn";
import { Visit } from "@/components/Visit";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { HOURS, STORE } from "@/lib/store";

// Local business data for Google. Every value comes from lib/store.ts.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ElectronicsStore",
  name: STORE.name,
  telephone: STORE.phoneE164,
  address: {
    "@type": "PostalAddress",
    streetAddress: STORE.address.street,
    addressLocality: STORE.address.city,
    addressCountry: STORE.address.countryCode,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      opens: HOURS.regular.open,
      closes: HOURS.regular.close,
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Friday",
      opens: HOURS.friday.open,
      closes: HOURS.friday.close,
    },
  ],
  sameAs: [STORE.socials.instagram.url, STORE.socials.threads.url],
};

export default function Home() {
  return (
    <>
      <a
        href="#produits"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-navy-950"
      >
        Aller aux produits
      </a>
      <Header />
      <main>
        <Hero />
        <Catalog />
        <PsPlus />
        <TradeIn />
        <Instagram />
        <Visit />
      </main>
      <Footer />
      <WhatsAppFab />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
