"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  ScrollText,
  Heart,
  Stethoscope,
  Globe,
  Wallet,
  Church,
  FileText,
  Users,
  Settings,
  Download,
  LayoutDashboard,
  User,
  Phone,
  ClipboardList,
  ListChecks,
  BookOpen,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", labelKey: "dashboard" as const, icon: LayoutDashboard },
  { href: "/eigenaar", labelKey: "mijnProfiel" as const, icon: User },
  { href: "/testament", labelKey: "testament" as const, icon: ScrollText },
  { href: "/euthanasie", labelKey: "wilsverklaring" as const, icon: Stethoscope },
  { href: "/donor", labelKey: "donorregistratie" as const, icon: Heart },
  { href: "/digitaal-bezit", labelKey: "digitaalBezit" as const, icon: Globe },
  { href: "/boedel", labelKey: "boedel" as const, icon: Wallet },
  { href: "/uitvaart", labelKey: "uitvaartwensen" as const, icon: Church },
  { href: "/documenten", labelKey: "documenten" as const, icon: FileText },
  { href: "/erfgenamen", labelKey: "erfgenamen" as const, icon: Users },
  { href: "/noodcontacten", labelKey: "noodcontacten" as const, icon: Phone },
  { href: "/tijdlijn", labelKey: "tijdlijnOverlijden" as const, icon: ListChecks },
  { href: "/export", labelKey: "exporteren" as const, icon: Download },
  { href: "/audit-log", labelKey: "activiteitenlog" as const, icon: ClipboardList },
  { href: "/instellingen", labelKey: "instellingen" as const, icon: Settings },
  { href: "/help", labelKey: "handleiding" as const, icon: BookOpen },
];

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      <div className="flex h-16 items-center border-b border-border px-6">
        <h1 className="text-xl font-bold text-primary">Lumio</h1>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-active text-sidebar-active-foreground"
                  : "text-sidebar-foreground hover:bg-muted"
              )}
            >
              <Icon className="h-4 w-4" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
