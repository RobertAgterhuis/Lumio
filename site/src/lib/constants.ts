import type { LucideIcon } from "lucide-react";
import {
  ScrollText, HeartHandshake, Heart, Monitor, Briefcase,
  FileText, PhoneCall, Flower2, Users,
  Brain, CalendarCheck, Lock,
  Award, Receipt, Zap,
  ShieldCheck, Download, PenLine,
} from "lucide-react";

export type IconItem = { icon: LucideIcon; title: string; description: string };

// ── Navigation ────────────────────────────────────────────────────────────────
export const NAV_LINKS = [
  { label: "Product",        href: "/product" },
  { label: "Demo",           href: "/demo",       highlight: true },
  { label: "Voor jezelf",    href: "/voor-jezelf" },
  { label: "Voor werkgevers", href: "/werkgevers" },
  { label: "Prijzen",        href: "/prijzen" },
  { label: "Contact",        href: "/contact" },
] as const;

// ── Pricing ────────────────────────────────────────────────────────────────────
export const PRICE_PER_USER = 125;

/**
 * Primary consumer purchase destination. Points to the dedicated B2C landing page
 * anchored at the pricing card — no B2B pricing adjacent, shortest path to purchase.
 *
 * Swap the value for an Odoo checkout URL when SP-CRO1-001 (EXTERN) is unblocked.
 */
export const BUY_CONSUMER_HREF = "/voor-jezelf#particulier";

/**
 * Mailto fallback used inside ConsumerPricing while the Odoo checkout
 * is EXTERN_BLOCKED (SP-CRO1-001). Replace with the Odoo payment link once available.
 */
export const BUY_CONSUMER_MAILTO =
  "mailto:info@lumio.app?subject=Lumio kopen&body=Ik wil graag een licentie aanschaffen.";

export const SCALE_TIERS = [
  { users: 10,  total: 1_250 },
  { users: 25,  total: 3_125 },
  { users: 50,  total: 6_250 },
  { users: 100, total: 12_500 },
] as const;

// WKR 2026: 2.00% over first €400k, 1.18% over remainder
export function calcWkrRuimte(loonsom: number): number {
  const base = Math.min(loonsom, 400_000) * 0.02;
  const rest = Math.max(0, loonsom - 400_000) * 0.0118;
  return base + rest;
}

// ── Employee features ─────────────────────────────────────────────────────────
export const PRODUCT_FEATURES: IconItem[] = [
  { icon: ScrollText,     title: "Testament",       description: "Vastleggen van laatste wensen rond bezit en nalatenschap." },
  { icon: HeartHandshake, title: "Wilsverklaring",   description: "Vastleggen van wensen rondom medische behandeling en levenseinde." },
  { icon: Heart,          title: "Donorregistratie", description: "Persoonlijke voorkeur voor orgaandonatie documenteren." },
  { icon: Monitor,        title: "Digitaal bezit",   description: "Overzicht van accounts, wachtwoorden en digitale abonnementen." },
  { icon: Briefcase,      title: "Boedel",           description: "Inventariseren van bezittingen, verzekeringen en financiën." },
  { icon: FileText,       title: "Documenten",       description: "Veilig opslaan van belangrijke persoonlijke documenten." },
  { icon: PhoneCall,      title: "Noodcontacten",    description: "Gestructureerd vastleggen wie er bij nood gebeld moet worden." },
  { icon: Flower2,        title: "Uitvaartwensen",   description: "Eigen wensen voor de uitvaart nauwkeurig en rustig vastleggen." },
  { icon: Users,          title: "Nabestaanden-modus", description: "Naasten krijgen via Shamir-noodcodes veilig toegang — alleen als genoeg erfgenamen hun code invullen. Wiskundige zekerheid, geen enkel risico op ongeautoriseerde toegang." },
];

// ── Employee benefits (Home) ──────────────────────────────────────────────────
export const EMPLOYEE_BENEFITS: IconItem[] = [
  { icon: Brain,         title: "Rust en overzicht", description: "Medewerkers die belangrijke zaken geregeld hebben, ervaren minder stress rond life events." },
  { icon: CalendarCheck, title: "Life events gedekt", description: "Van testament tot digitale nalatenschap — alles op één veilige plek, klaar als het nodig is." },
  { icon: Lock,          title: "Privé en veilig",   description: "Lokale opslag op het apparaat van de medewerker zelf. Geen cloud, geen server, geen inzage werkgever." },
];

// ── Employer benefits (Home) ──────────────────────────────────────────────────
export const EMPLOYER_BENEFITS: IconItem[] = [
  { icon: Award,   title: "Modern werkgeverschap", description: "Laat zien dat u investeert in uw medewerkers als mens, niet alleen als functie." },
  { icon: Receipt, title: "WKR-passend",           description: "€125 p.p. valt ruim binnen de WKR vrije ruimte. Kosten zijn volledig aftrekbaar." },
  { icon: Zap,     title: "Geen implementatie",    description: "Geen IT-project, geen processen, geen training. Beschikbaar stellen en klaar." },
];

// ── Werkgevers page ────────────────────────────────────────────────────────────
export const HOE_WERKT_HET_STEPS = [
  {
    step: "01",
    title: "Licenties aanschaffen",
    description:
      "U koopt licenties per medewerker. Facturering per jaar, opzegbaar.",
  },
  {
    step: "02",
    title: "Beschikbaar stellen",
    description:
      "Één interne aankondiging volstaat. Vrijwillig gebruik, geen training nodig.",
  },
  {
    step: "03",
    title: "Evalueren & opschalen",
    description:
      "Na 6–12 maanden evalueert u gebruik en waardering. Daarna beslissen over continuering.",
  },
] as const;

// ── FAQ (Werkgevers + Prijzen) ────────────────────────────────────────────────
export const FAQ_ITEMS = [
  {
    question: "Gaan medewerkers Lumio echt gebruiken?",
    answer:
      "De aanschaf heeft een hoge persoonlijke relevantie voor medewerkers — dit type benefit heeft doorgaans een goede adoptie zonder dat training nodig is.",
  },
  {
    question: "Kan mijn werkgever mijn informatie zien?",
    answer:
      "Nee. Lumio slaat data lokaal op het apparaat van de medewerker zelf op. De organisatie heeft geen inzage. Het is een persoonlijke tool, geen HR-systeem.",
  },
  {
    question: "Past dit binnen onze WKR?",
    answer:
      "Ja. Bij een loonsom van €1 miljoen bedraagt de WKR vrije ruimte ca. €15.080 voor 2026. Lumio kost €6.250 voor 50 medewerkers — dat is ±41% van de vrije ruimte.",
  },
  {
    question: "Is er een IT-project voor nodig?",
    answer:
      "Nee. Lumio is een desktopapplicatie die medewerkers zelf installeren op hun eigen apparaat. Geen integraties, geen servers, geen IT-afdeling betrokken.",
  },
  {
    question: "Wat als we stoppen?",
    answer:
      "Licenties zijn jaarlijks. U kunt eenvoudig niet verlengen. Er zijn geen implementatiekosten die sunk zijn.",
  },
  {
    question: "Wat is de ROI?",
    answer:
      "Lumio is geen efficiency-tool. Het is een benefit met hoge perceptiewaarde: medewerkers waarderen de ondersteuning. Vergelijkbaar met andere personeelsvoordelen.",
  },
] as const;

// ── B2C: Consumer constants ────────────────────────────────────────────────────
export const CONSUMER_BENEFITS: IconItem[] = [
  {
    icon: Brain,
    title: "Rust in je hoofd",
    description: "Jij hebt het geregeld. Je familie hoeft straks geen tijdrovende zoektocht te doen naar testament, wachtwoorden of donorwens.",
  },
  {
    icon: ShieldCheck,
    title: "Jouw data, alleen van jou",
    description: "Alles blijft lokaal op jouw apparaat. Geen cloud, geen server, geen abonnement. Lumio kan er niet bij — niemand anders ook.",
  },
  {
    icon: HeartHandshake,
    title: "Een cadeau voor je naasten",
    description: "Via de erfgenamen modus geef jij vertrouwde mensen op het juiste moment toegang. Geen verrassingen, maar duidelijkheid.",
  },
];

export const CONSUMER_HOW_IT_WORKS = [
  {
    title: "Eenmalig kopen & installeren",
    description: "Betaal €125 en download Lumio direct. Geen abonnement, geen account aanmaken, geen maillijst.",
  },
  {
    title: "Vul in wat er toe doet",
    description: "Testament, wilsverklaring, wachtwoorden, donorwens, bankrekeningen — alles op één plek, in jouw eigen tempo.",
  },
  {
    title: "Geef het door als het moet",
    description: "Stel de erfgenamen modus in zodat de juiste persoon toegang krijgt. Jij bepaalt wanneer en aan wie.",
  },
];

export const CONSUMER_FAQ_ITEMS = [
  {
    question: "Wat kost Lumio voor particulieren?",
    answer: "€125 eenmalig — geen jaarkosten, geen abonnement. Je koopt de licentie één keer en gebruikt hem voor altijd.",
  },
  {
    question: "Op hoeveel apparaten kan ik Lumio gebruiken?",
    answer: "Je licentie geldt voor één apparaat. Wil je Lumio ook op een tweede computer? Neem dan contact op, we denken graag mee.",
  },
  {
    question: "Gaan mijn gegevens naar de cloud?",
    answer: "Nee. Lumio slaat alles lokaal op jouw apparaat op, versleuteld met jouw eigen PIN. We ontvangen nooit je persoonlijke gegevens.",
  },
  {
    question: "Is er een proefperiode?",
    answer: "Er is geen gratis proefversie, maar de app heeft een onboarding die je stap voor stap helpt. Niet tevreden? Neem contact op, we lossen het op.",
  },
  {
    question: "Werkt Lumio op Mac en Windows?",
    answer: "Ja. Lumio is beschikbaar voor Windows en macOS. Een mobiele versie is in ontwikkeling.",
  },
  {
    question: "Wat gebeurt er met mijn data als ik stop?",
    answer: "Jouw data staat alleen op jouw apparaat. Als je Lumio verwijdert, verwijder je ook je eigen data. Er is niets bij ons opgeslagen.",
  },
] as const;
