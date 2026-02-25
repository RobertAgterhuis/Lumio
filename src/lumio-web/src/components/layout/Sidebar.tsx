"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useDomainQuery } from "@/hooks/useDomainQuery";
import { LumioLogoIcon } from "./LumioLogoIcon";
import { LumioIcon, type LumioIconName } from "@/components/ui/lumio-icon";
import {
  Settings,
  Download,
  ClipboardList,
  BookOpen,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

interface DomeinStatus {
  domein: string;
  label: string;
  ingevuld: boolean;
}

interface Compleetheid {
  percentage: number;
  aantalIngevuld: number;
  totaal: number;
  domeinen: DomeinStatus[];
}

interface NavItem {
  href: string;
  labelKey: string;
  icon?: LucideIcon;
  lumioIcon?: LumioIconName;
}

interface NavGroup {
  labelKey: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    labelKey: "groep.overzicht",
    items: [
      { href: "/dashboard", labelKey: "dashboard", lumioIcon: "dashboard" as LumioIconName },
      { href: "/eigenaar", labelKey: "mijnProfiel", lumioIcon: "profiel" as LumioIconName },
    ],
  },
  {
    labelKey: "groep.wensen",
    items: [
      { href: "/testament", labelKey: "testament", lumioIcon: "testament" as LumioIconName },
      { href: "/euthanasie", labelKey: "wilsverklaring", lumioIcon: "wilsverklaring" as LumioIconName },
      { href: "/donor", labelKey: "donorregistratie", lumioIcon: "donor" as LumioIconName },
      { href: "/uitvaart", labelKey: "uitvaartwensen", lumioIcon: "uitvaart" as LumioIconName },
    ],
  },
  {
    labelKey: "groep.bezittingen",
    items: [
      { href: "/digitaal-bezit", labelKey: "digitaalBezit", lumioIcon: "digitaal-bezit" as LumioIconName },
      { href: "/boedel", labelKey: "boedel", lumioIcon: "boedel" as LumioIconName },
      { href: "/documenten", labelKey: "documenten", lumioIcon: "documenten" as LumioIconName },
    ],
  },
  {
    labelKey: "groep.personen",
    items: [
      { href: "/erfgenamen", labelKey: "erfgenamen", lumioIcon: "erfgenamen" as LumioIconName },
      { href: "/noodcontacten", labelKey: "noodcontacten", lumioIcon: "noodcontacten" as LumioIconName },
    ],
  },
  {
    labelKey: "groep.hulpmiddelen",
    items: [
      { href: "/tijdlijn", labelKey: "tijdlijnOverlijden", lumioIcon: "tijdlijn" as LumioIconName },
      { href: "/export", labelKey: "exporteren", icon: Download },
      { href: "/audit-log", labelKey: "activiteitenlog", icon: ClipboardList },
      { href: "/instellingen", labelKey: "instellingen", icon: Settings },
      { href: "/help", labelKey: "handleiding", icon: BookOpen },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const { data: compleetheid } = useDomainQuery<Compleetheid>("status/compleetheid");

  // Create a map of domain -> completed status for O(1) lookup
  const completedDomains = new Map<string, boolean>(
    compleetheid?.domeinen?.map((d) => [d.domein, d.ingevuld]) ?? []
  );

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
        <LumioLogoIcon size={28} />
        <h1 className="text-xl font-bold text-primary">Lumio</h1>
      </div>
      <nav aria-label={t("navigatie")} className="flex-1 overflow-y-auto p-3">
        {navGroups.map((group, groupIndex) => (
          <div key={group.labelKey} className={cn(groupIndex > 0 && "mt-4")}>
            <h2 className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t(group.labelKey)}
            </h2>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname?.startsWith(item.href);
                const Icon = item.icon;
                // Domain name is the href without the leading slash
                const domainName = item.href.slice(1);
                const isCompleted = completedDomains.get(domainName) === true;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-active text-sidebar-active-foreground"
                        : "text-sidebar-foreground hover:bg-muted"
                    )}
                  >
                    {item.lumioIcon ? (
                      <LumioIcon name={item.lumioIcon} size="sm" />
                    ) : Icon ? (
                      <Icon className="h-4 w-4" />
                    ) : null}
                    <span className="flex-1">{t(item.labelKey)}</span>
                    {isCompleted && (
                      <CheckCircle2 className="h-4 w-4 text-success" aria-label="Completed" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
