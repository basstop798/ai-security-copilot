# Sony Game, Blida

One-page website for **Sony Game**, a video game store in Blida (Résidence Chréa, Bd Mohamed Boudiaf). It sells, buys, exchanges and repairs consoles, and sells PS Plus subscriptions. The site is in French, and every order button opens WhatsApp with a pre-filled message.

Built with Next.js 16 (App Router), React 19 and Tailwind CSS 4, exported as a static site.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # static site in out/
npm test             # opening-hours, PS Plus pricing and WhatsApp link tests
npm run lint && npm run typecheck
```

`out/` is plain HTML/CSS/JS. Deploy it to Vercel, Netlify, GitHub Pages or any shared host.

## Sections

| Section | Anchor | Notes |
|---|---|---|
| Hero | `#top` | Tagline, WhatsApp CTA, live "Ouvert / Fermé" status (Algiers time) |
| Category highlights | none | Instagram-story-style circles. Clicking one filters the product grid |
| Products | `#produits` | Category filter, sample items, "Commander" opens WhatsApp |
| Abonnements PS Plus | `#ps-plus` | Essentiel / Extra / Deluxe with a 1 / 3 / 12-month selector, savings worked out automatically |
| Vendre / Échanger / Réparer | `#vendre` | Three services plus the "Je veux vendre ma console" button |
| Instagram | `#instagram` | Six static tiles linking to @sony_game.09 (no API) |
| Contact | `#contact` | Address, hours, phone, socials, Google Maps embed |
| Footer | none | Independence note and trademark notice |

## Editing content

Everything the owner may change is in **`lib/store.ts`**: contact details, hours, categories, products, PS Plus prices and Instagram tiles.

- **Logo:** put the owner's logo in `public/` (e.g. `public/logo.png`) and set `logo: "/logo.png"`. Until then the text wordmark "Sony Game" is shown.
- **Product photos:** add `image: "/products/xyz.jpg"` to a product. Without one, a generic line illustration is used.
- **Instagram tiles:** add `image: "/instagram/1.jpg"` to a tile to show a real post picture.
- **Prices:** `price: null` shows "Sur demande" / "Prix sur demande".

## To confirm with the owner before launch

Search the code for `TODO(owner)`.

- [ ] +213 557 43 07 43 is the store's WhatsApp number
- [ ] PS Plus prices (taken from an Instagram post) are current
- [ ] 12-month PS Plus prices for all three plans (currently "Prix sur demande")
- [ ] The Facebook page URL (currently a Facebook search link for "Sonygames Blida")
- [ ] Real products, conditions and prices to replace the sample list
- [ ] The logo file

## Brand rules

- No Sony, PlayStation, Xbox or Nintendo logos, and no controller button symbols. All icons are generic line drawings.
- The copy does not claim the store is an official or authorized dealer. The footer says the store is independent, and adds: "PlayStation, Xbox and Nintendo are trademarks of their respective owners."
