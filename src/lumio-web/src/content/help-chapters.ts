import type { LucideIcon } from "lucide-react";
import {
  Rocket,
  LayoutDashboard,
  User,
  ScrollText,
  Stethoscope,
  Heart,
  Globe,
  Wallet,
  Church,
  FileText,
  Users,
  Phone,
  Settings,
  Eye,
} from "lucide-react";

export interface HelpChapter {
  /** Unique slug used in navigation */
  slug: string;
  /** Chapter number (1-14) */
  number: number;
  /** i18n key for the chapter title (under "help.chapters") */
  titleKey: string;
  /** Icon shown in navigation */
  icon: LucideIcon;
  /** Filename of the markdown file (NL) */
  fileNl: string;
  /** Filename of the markdown file (EN) */
  fileEn: string;
  /** Route path this chapter is related to (for contextual help) */
  relatedRoute?: string;
}

/**
 * All user-manual chapters with metadata.
 * The markdown content is served from /help/{locale}/{file}.
 */
export const helpChapters: HelpChapter[] = [
  {
    slug: "aan-de-slag",
    number: 1,
    titleKey: "aanDeSlag",
    icon: Rocket,
    fileNl: "01-aan-de-slag.md",
    fileEn: "01-getting-started.md",
  },
  {
    slug: "dashboard",
    number: 2,
    titleKey: "dashboard",
    icon: LayoutDashboard,
    fileNl: "02-dashboard.md",
    fileEn: "02-dashboard.md",
    relatedRoute: "/dashboard",
  },
  {
    slug: "mijn-profiel",
    number: 3,
    titleKey: "mijnProfiel",
    icon: User,
    fileNl: "03-mijn-profiel.md",
    fileEn: "03-my-profile.md",
    relatedRoute: "/eigenaar",
  },
  {
    slug: "testament",
    number: 4,
    titleKey: "testament",
    icon: ScrollText,
    fileNl: "04-testament.md",
    fileEn: "04-will.md",
    relatedRoute: "/testament",
  },
  {
    slug: "wilsverklaring",
    number: 5,
    titleKey: "wilsverklaring",
    icon: Stethoscope,
    fileNl: "05-wilsverklaring.md",
    fileEn: "05-advance-directive.md",
    relatedRoute: "/euthanasie",
  },
  {
    slug: "donorregistratie",
    number: 6,
    titleKey: "donorregistratie",
    icon: Heart,
    fileNl: "06-donorregistratie.md",
    fileEn: "06-organ-donation.md",
    relatedRoute: "/donor",
  },
  {
    slug: "digitaal-bezit",
    number: 7,
    titleKey: "digitaalBezit",
    icon: Globe,
    fileNl: "07-digitaal-bezit.md",
    fileEn: "07-digital-assets.md",
    relatedRoute: "/digitaal-bezit",
  },
  {
    slug: "boedel",
    number: 8,
    titleKey: "boedel",
    icon: Wallet,
    fileNl: "08-boedel.md",
    fileEn: "08-estate.md",
    relatedRoute: "/boedel",
  },
  {
    slug: "uitvaartwensen",
    number: 9,
    titleKey: "uitvaartwensen",
    icon: Church,
    fileNl: "09-uitvaartwensen.md",
    fileEn: "09-funeral-wishes.md",
    relatedRoute: "/uitvaart",
  },
  {
    slug: "documenten",
    number: 10,
    titleKey: "documenten",
    icon: FileText,
    fileNl: "10-documenten.md",
    fileEn: "10-documents.md",
    relatedRoute: "/documenten",
  },
  {
    slug: "erfgenamen",
    number: 11,
    titleKey: "erfgenamen",
    icon: Users,
    fileNl: "11-erfgenamen.md",
    fileEn: "11-heirs.md",
    relatedRoute: "/erfgenamen",
  },
  {
    slug: "noodcontacten",
    number: 12,
    titleKey: "noodcontacten",
    icon: Phone,
    fileNl: "12-noodcontacten.md",
    fileEn: "12-emergency-contacts.md",
    relatedRoute: "/noodcontacten",
  },
  {
    slug: "overige-functies",
    number: 13,
    titleKey: "overigeFuncties",
    icon: Settings,
    fileNl: "13-overige-functies.md",
    fileEn: "13-other-features.md",
    relatedRoute: "/instellingen",
  },
  {
    slug: "nabestaanden",
    number: 14,
    titleKey: "nabestaanden",
    icon: Eye,
    fileNl: "14-nabestaanden.md",
    fileEn: "14-heir-mode.md",
  },
];

/** Find the help chapter that corresponds to a given app route */
export function getChapterForRoute(pathname: string): HelpChapter | undefined {
  return helpChapters.find(
    (ch) => ch.relatedRoute && pathname.startsWith(ch.relatedRoute)
  );
}

/** Get the markdown file URL for a chapter in the given locale */
export function getChapterUrl(chapter: HelpChapter, locale: string): string {
  const file = locale === "en" ? chapter.fileEn : chapter.fileNl;
  return `/help/${locale === "en" ? "en" : "nl"}/${file}`;
}
