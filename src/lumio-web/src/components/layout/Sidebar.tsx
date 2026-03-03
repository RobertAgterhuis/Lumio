"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useDomainQuery } from "@/hooks/useDomainQuery";
import { LumioLogoIcon } from "./LumioLogoIcon";
import { LumioIcon, type LumioIconName } from "@/components/ui/lumio-icon";
import { usePreferencesStore } from "@/stores/preferencesStore";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Settings,
  Download,
  ClipboardList,
  BookOpen,
  CheckCircle2,
  Video,
  PanelLeftClose,
  PanelLeftOpen,
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
      { href: "/videoboodschappen", labelKey: "videoboodschappen", icon: Video },
      { href: "/export", labelKey: "exporteren", icon: Download },
    ],
  },
  {
    labelKey: "groep.beheer",
    items: [
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
  const { sidebarCollapsed, toggleSidebar } = usePreferencesStore();

  // Create a map of domain -> completed status for O(1) lookup
  const completedDomains = new Map<string, boolean>(
    compleetheid?.domeinen?.map((d) => [d.domein, d.ingevuld]) ?? []
  );

  return (
    <TooltipProvider delayDuration={300}>
      <aside
        className={cn(
          "flex h-full flex-col border-r border-border bg-sidebar overflow-hidden transition-[width] duration-200 ease-in-out",
          sidebarCollapsed ? "w-14" : "w-64"
        )}
      >
        {/* Header / Logo area */}
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-border",
            sidebarCollapsed ? "justify-center" : "gap-2.5 px-5"
          )}
        >
          <LumioLogoIcon size={28} />
          {!sidebarCollapsed && (
            <>
              <h1 className="flex-1 text-xl font-bold text-primary">Lumio</h1>
              <button
                onClick={toggleSidebar}
                aria-label="Navigatiemenu verbergen"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <PanelLeftClose aria-hidden="true" className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav aria-label={t("navigatie")} className="flex-1 overflow-y-auto p-2">
          {navGroups.map((group, groupIndex) => (
            <div key={group.labelKey} className={cn(groupIndex > 0 && "mt-4")}>
              {!sidebarCollapsed ? (
                <h2 className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t(group.labelKey)}
                </h2>
              ) : groupIndex > 0 ? (
                <div className="my-2 mx-2 border-t border-border" />
              ) : null}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname?.startsWith(item.href);
                  const Icon = item.icon;
                  const domainName = item.href.slice(1);
                  const isCompleted = completedDomains.get(domainName) === true;
                  const label = t(item.labelKey);

                  if (sidebarCollapsed) {
                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger asChild>
                          <Link
                            href={item.href}
                            aria-current={isActive ? "page" : undefined}
                            aria-label={label}
                            className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-md mx-auto transition-colors",
                              isActive
                                ? "bg-sidebar-active text-sidebar-active-foreground"
                                : "text-sidebar-foreground hover:bg-muted"
                            )}
                          >
                            {item.lumioIcon ? (
                              <LumioIcon name={item.lumioIcon} size="sm" />
                            ) : Icon ? (
                              <Icon aria-hidden="true" className="h-4 w-4" />
                            ) : null}
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <div className="flex items-center gap-2">
                            {label}
                            {isCompleted && (
                              <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5 text-success" />
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

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
                        <Icon aria-hidden="true" className="h-4 w-4" />
                      ) : null}
                      <span className="flex-1">{label}</span>
                      {isCompleted && (
                        <CheckCircle2 className="h-4 w-4 text-success" aria-label="Voltooid" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Completeness indicator */}
        {!sidebarCollapsed && compleetheid && (
          <div className="shrink-0 border-t border-border/50 px-3 py-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {t("voortgang", {
                  aantalIngevuld: compleetheid.aantalIngevuld,
                  totaal: compleetheid.totaal,
                })}
              </span>
              <span className="text-xs font-bold text-primary">{compleetheid.percentage}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${compleetheid.percentage}%` }}
                role="progressbar"
                aria-valuenow={compleetheid.percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={t("voortgangAria", { percentage: compleetheid.percentage })}
              />
            </div>
          </div>
        )}

        {/* Footer toggle */}
        <div className="shrink-0 border-t border-border p-2">
          <button
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? "Navigatiemenu tonen" : "Navigatiemenu verbergen"}
            className={cn(
              "flex w-full items-center gap-2 rounded-md py-2 text-sm font-medium hover:bg-muted transition-colors",
              sidebarCollapsed
                ? "justify-center px-0 text-primary hover:text-primary"
                : "px-3 text-muted-foreground hover:text-foreground"
            )}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen aria-hidden="true" className="h-4 w-4" />
            ) : (
              <>
                <PanelLeftClose aria-hidden="true" className="h-4 w-4" />
                <span>Verberg menu</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
