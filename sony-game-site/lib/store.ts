// All the store's editable content lives in this file: contact details,
// hours, categories, products, PS Plus prices and Instagram tiles.
// Items marked TODO(owner) still need the store owner's confirmation.

export const STORE = {
  name: "Sony Game",
  // The listing name on Google Maps, used for the map and directions.
  mapsName: "Sony Games Blida",
  tagline: "Votre satisfaction, notre priorité",
  // Logo slot: put the owner's logo file in public/ (e.g. public/logo.png)
  // and set this to "/logo.png". While it is null, the text wordmark shows.
  logo: null as string | null,
  address: {
    street: "Résidence Chréa, Bd Mohamed Boudiaf",
    city: "Blida",
    countryCode: "DZ",
  },
  phoneDisplay: "+213 557 43 07 43",
  phoneE164: "+213557430743",
  // TODO(owner): confirm this number is the store's WhatsApp.
  whatsapp: "213557430743",
  services: ["Vente", "Achat", "Échange", "Réparation"],
  socials: {
    instagram: {
      handle: "@sony_game.09",
      url: "https://www.instagram.com/sony_game.09/",
    },
    // TODO(owner): replace with the page's own URL (facebook.com/...).
    facebook: {
      handle: "Sonygames Blida",
      url: "https://www.facebook.com/search/top?q=Sonygames%20Blida",
    },
    threads: {
      handle: "@sony_game.09",
      url: "https://www.threads.com/@sony_game.09",
    },
  },
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Sony%20Games%20Blida",
  mapsEmbedUrl:
    "https://www.google.com/maps?q=Sony%20Games%20Blida&output=embed",
};

// Opening hours, Algiers local time. JS day numbers: 0 = Sunday … 6 = Saturday.
export const HOURS = {
  regular: { open: "09:30", close: "23:30" },
  friday: { open: "16:00", close: "23:30" },
};

export const HOURS_TABLE = [
  { days: "Samedi – Jeudi", dayNumbers: [6, 0, 1, 2, 3, 4], ...HOURS.regular },
  { days: "Vendredi", dayNumbers: [5], ...HOURS.friday },
];

export type CategoryId =
  | "ps5"
  | "ps4"
  | "xbox"
  | "switch"
  | "manettes"
  | "casques"
  | "jeux";

export const CATEGORIES: { id: CategoryId; label: string; title: string }[] = [
  { id: "ps5", label: "PS5", title: "PlayStation 5" },
  { id: "xbox", label: "Xbox", title: "Xbox Series S|X" },
  { id: "switch", label: "Switch", title: "Nintendo Switch" },
  { id: "casques", label: "Casques", title: "Casques gaming" },
  { id: "ps4", label: "PS4", title: "PlayStation 4" },
  { id: "manettes", label: "Manettes", title: "Manettes" },
  { id: "jeux", label: "Jeux", title: "Jeux vidéo" },
];

export type Product = {
  id: string;
  name: string;
  category: CategoryId;
  detail: string;
  condition: "Neuf" | "Occasion";
  // In dinars. null shows "Prix sur demande".
  price: number | null;
  // Optional photo in public/, e.g. "/products/ps5-slim.jpg".
  image?: string;
};

// TODO(owner): sample items. Replace with the real stock, prices and photos.
export const PRODUCTS: Product[] = [
  { id: "ps5-slim", name: "PS5 Slim Standard", category: "ps5", detail: "1 To · lecteur disque · 1 manette", condition: "Neuf", price: null },
  { id: "ps5-slim-digital", name: "PS5 Slim Digital", category: "ps5", detail: "1 To · sans lecteur · 1 manette", condition: "Neuf", price: null },
  { id: "ps5-pro", name: "PS5 Pro", category: "ps5", detail: "2 To · 1 manette", condition: "Neuf", price: null },
  { id: "ps4-slim", name: "PS4 Slim 500 Go", category: "ps4", detail: "1 manette · câbles inclus", condition: "Occasion", price: null },
  { id: "ps4-pro", name: "PS4 Pro 1 To", category: "ps4", detail: "1 manette · câbles inclus", condition: "Occasion", price: null },
  { id: "xbox-series-x", name: "Xbox Series X", category: "xbox", detail: "1 To · lecteur disque", condition: "Neuf", price: null },
  { id: "xbox-series-s", name: "Xbox Series S", category: "xbox", detail: "512 Go · 100 % digitale", condition: "Neuf", price: null },
  { id: "switch-2", name: "Nintendo Switch 2", category: "switch", detail: "256 Go · 2 Joy-Con", condition: "Neuf", price: null },
  { id: "switch-oled", name: "Nintendo Switch OLED", category: "switch", detail: "64 Go · écran OLED 7\"", condition: "Neuf", price: null },
  { id: "switch-lite", name: "Nintendo Switch Lite", category: "switch", detail: "32 Go · format portable", condition: "Occasion", price: null },
  { id: "dualsense", name: "Manette DualSense", category: "manettes", detail: "PS5 · plusieurs coloris", condition: "Neuf", price: null },
  { id: "dualshock-4", name: "Manette DualShock 4", category: "manettes", detail: "PS4", condition: "Neuf", price: null },
  { id: "xbox-controller", name: "Manette sans fil Xbox", category: "manettes", detail: "Xbox Series, Xbox One, PC", condition: "Neuf", price: null },
  { id: "pulse-elite", name: "Casque PULSE Elite", category: "casques", detail: "Sans fil · PS5", condition: "Neuf", price: null },
  { id: "headset-wired", name: "Casque gaming filaire", category: "casques", detail: "Jack 3,5 mm · PS5, PS4, Xbox, Switch", condition: "Neuf", price: null },
  { id: "fc-26", name: "EA Sports FC 26", category: "jeux", detail: "PS5 · PS4 · Xbox", condition: "Neuf", price: null },
  { id: "bo7", name: "Call of Duty: Black Ops 7", category: "jeux", detail: "PS5 · Xbox Series", condition: "Neuf", price: null },
  { id: "mario-kart-world", name: "Mario Kart World", category: "jeux", detail: "Nintendo Switch 2", condition: "Neuf", price: null },
];

export type Months = 1 | 3 | 12;

export type PsPlusPlan = {
  id: string;
  name: string;
  pitch: string;
  // In dinars. null shows "Prix sur demande".
  prices: Record<Months, number | null>;
  features: string[];
  badge?: string;
  tone: "slate" | "blue" | "red";
};

export const DURATIONS: { months: Months; label: string }[] = [
  { months: 1, label: "1 mois" },
  { months: 3, label: "3 mois" },
  { months: 12, label: "12 mois" },
];

// TODO(owner): prices copied from the store's Instagram post; confirm they
// are current and add the 12-month prices.
export const PS_PLUS_PLANS: PsPlusPlan[] = [
  {
    id: "essentiel",
    name: "Essentiel",
    pitch: "Pour jouer en ligne avec vos amis.",
    prices: { 1: 2400, 3: 5100, 12: null },
    features: [
      "Multijoueur en ligne",
      "Jeux offerts chaque mois",
      "Sauvegardes dans le cloud",
      "Réductions exclusives sur le PS Store",
    ],
    tone: "slate",
  },
  {
    id: "extra",
    name: "Extra",
    pitch: "Un catalogue de jeux à télécharger.",
    prices: { 1: 3400, 3: 8200, 12: null },
    features: [
      "Tout le contenu Essentiel",
      "Catalogue de centaines de jeux PS5 et PS4",
    ],
    tone: "blue",
  },
  {
    id: "deluxe",
    name: "Deluxe",
    pitch: "Tout, plus les classiques et les essais.",
    prices: { 1: 4000, 3: 9250, 12: null },
    features: [
      "Tout le contenu Extra",
      "Catalogue de jeux classiques",
      "Essais de jeux à durée limitée",
    ],
    badge: "Le plus complet",
    tone: "red",
  },
];

// Static tiles that all link to the Instagram profile (no live API).
// To show real posts, add an `image` path in public/, e.g. "/instagram/1.jpg".
export const INSTAGRAM_TILES: {
  label: string;
  category: CategoryId | "psplus" | "store";
  image?: string;
}[] = [
  { label: "Nouveaux arrivages", category: "ps5" },
  { label: "Offres PS Plus", category: "psplus" },
  { label: "Manettes", category: "manettes" },
  { label: "Jeux du moment", category: "jeux" },
  { label: "Casques", category: "casques" },
  { label: "La boutique", category: "store" },
];
