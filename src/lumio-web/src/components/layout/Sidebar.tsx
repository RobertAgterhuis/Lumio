"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/eigenaar", label: "Mijn Profiel", icon: User },
  { href: "/testament", label: "Testament", icon: ScrollText },
  { href: "/euthanasie", label: "Wilsverklaring", icon: Stethoscope },
  { href: "/donor", label: "Donorregistratie", icon: Heart },
  { href: "/digitaal-bezit", label: "Digitaal Bezit", icon: Globe },
  { href: "/boedel", label: "Boedel", icon: Wallet },
  { href: "/uitvaart", label: "Uitvaartwensen", icon: Church },
  { href: "/documenten", label: "Documenten", icon: FileText },
  { href: "/erfgenamen", label: "Erfgenamen", icon: Users },
  { href: "/noodcontacten", label: "Noodcontacten", icon: Phone },
  { href: "/export", label: "Exporteren", icon: Download },
  { href: "/audit-log", label: "Activiteitenlog", icon: ClipboardList },
  { href: "/instellingen", label: "Instellingen", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

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
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
