"use client";

import { useState } from "react";
import {
  User, Phone, ScrollText, Stethoscope, Heart, Wallet, Globe,
  Church, Users, FileText, Lock, CheckCircle2, AlertTriangle,
  Clock, Eye, EyeOff, X, LayoutDashboard, Settings,
  Download, Archive, Flag, Calendar, ShieldAlert,
} from "lucide-react";
import {
  DOMEINEN, STAPPENPLAN, COMPLEETHEID, EIGENAAR_NAAM, ERFGENAAM_NAAM,
  type DomeinData,
} from "@/lib/demo-data";

// ── Icon map ──────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  User, Phone, ScrollText, Stethoscope, Heart, Wallet, Globe,
  Church, Users, FileText, LayoutDashboard,
};
function DomeinIcon({
  name, className, style,
}: {
  name: string; className?: string; style?: React.CSSProperties;
}) {
  const Icon = ICON_MAP[name] ?? FileText;
  return <Icon className={className} style={style} />;
}

// ── Domain color map (mirrors dashboard/page.tsx domainCards) ────────────
const DOMEIN_COLORS: Record<string, { color: string; bgColor: string }> = {
  eigenaar:         { color: "text-primary-600", bgColor: "bg-primary-100" },
  noodcontacten:    { color: "text-primary-600", bgColor: "bg-primary-100" },
  testament:        { color: "text-sage",         bgColor: "bg-sage-100" },
  wilsverklaring:   { color: "text-sage",         bgColor: "bg-sage-100" },
  donor:            { color: "text-success",      bgColor: "bg-success-100" },
  uitvaart:         { color: "text-sage",         bgColor: "bg-sage-100" },
  erfgenamen:       { color: "text-primary-600", bgColor: "bg-primary-100" },
  boedel:           { color: "text-success",      bgColor: "bg-success-100" },
  "digitaal-bezit": { color: "text-primary-600", bgColor: "bg-primary-100" },
  documenten:       { color: "text-sage",         bgColor: "bg-sage-100" },
};

// ── Fase config (mirrors NabestaandenDashboard faseConfig exactly) ────────
const FASE_CONFIG = {
  urgent: {
    Icon: AlertTriangle,
    color:       "text-danger",
    bgColor:     "bg-danger-100",
    borderColor: "border-danger",
    badgeClass:  "bg-danger-100 text-danger",
  },
  week1: {
    Icon: Clock,
    color:       "text-warning",
    bgColor:     "bg-warning-100",
    borderColor: "border-warning",
    badgeClass:  "bg-warning-100 text-warning",
  },
  maand1: {
    Icon: Calendar,
    color:       "text-info",
    bgColor:     "bg-info-100",
    borderColor: "border-info",
    badgeClass:  "bg-info-100 text-info",
  },
  afronden: {
    Icon: Flag,
    color:       "text-success",
    bgColor:     "bg-success-100",
    borderColor: "border-success",
    badgeClass:  "bg-success-100 text-success",
  },
} as const;

// ── Sidebar nav groups (matches Sidebar.tsx) ──────────────────────────────
const NAV_GROEPEN = [
  {
    label: "Overzicht",
    items: [{ id: "dashboard", label: "Dashboard", icon: "LayoutDashboard" }],
  },
  {
    label: "Wensen & documenten",
    items: [
      { id: "testament",      label: "Testament",        icon: "ScrollText" },
      { id: "wilsverklaring", label: "Wilsverklaring",   icon: "Stethoscope" },
      { id: "donor",          label: "Donorregistratie", icon: "Heart" },
      { id: "uitvaart",       label: "Uitvaartwensen",   icon: "Church" },
    ],
  },
  {
    label: "Bezittingen",
    items: [
      { id: "digitaal-bezit", label: "Digitaal bezit", icon: "Globe" },
      { id: "boedel",         label: "Boedel",         icon: "Wallet" },
      { id: "documenten",     label: "Documenten",     icon: "FileText" },
    ],
  },
  {
    label: "Personen",
    items: [
      { id: "erfgenamen",    label: "Erfgenamen",    icon: "Users" },
      { id: "noodcontacten", label: "Noodcontacten", icon: "Phone" },
    ],
  },
];

// ── Field row (matches CardContent pt-5 space-y-2 text-sm + font-medium label) ─
function Veld({
  label, waarde, gevoelig, maskAlles,
}: {
  label: string; waarde: string; gevoelig?: boolean; maskAlles?: boolean;
}) {
  const [toon, setToon] = useState(false);
  const mask = (maskAlles && gevoelig) || (gevoelig && !toon);
  return (
    <div className="flex items-center gap-2">
      <span className="flex-1 text-sm">
        <span className="font-medium">{label}</span>{" "}
        {mask ? (
          <span className="font-mono tracking-widest text-muted-foreground">
            {"•".repeat(Math.min(waarde.length, 12))}
          </span>
        ) : (
          <span className="text-muted-foreground">{waarde}</span>
        )}
      </span>
      {gevoelig && !maskAlles && (
        <button
          onClick={() => setToon((v) => !v)}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={toon ? "Verberg" : "Toon"}
        >
          {toon ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  );
}

// ── Domain detail (matches testament/page.tsx card+header-bar pattern) ────
function DomeinDetail({
  domein, maskGevoelig,
}: {
  domein: DomeinData; maskGevoelig?: boolean;
}) {
  const colors = DOMEIN_COLORS[domein.id] ?? DOMEIN_COLORS.eigenaar;
  return (
    <div className="space-y-5">
      {/* Page title — text-3xl font-bold flex items-center gap-3 (real app pattern) */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3 text-foreground">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${colors.bgColor}`}>
            <DomeinIcon name={domein.icon} className={`h-5 w-5 ${colors.color}`} />
          </div>
          {domein.label}
        </h1>
        <p className="text-sm text-muted-foreground mt-1 ml-[52px]">{domein.beschrijving}</p>
      </div>

      {/* Card sections with colored header bar — matches testament/page.tsx exactly */}
      {domein.secties.map((sectie) => (
        <div key={sectie.titel} className="overflow-hidden rounded-lg border border-border bg-card">
          {/* bg-sage-100 header bar with text-sage icon + title */}
          <div className="bg-sage-100 px-4 py-3 flex items-center gap-3 border-b border-black/5">
            <DomeinIcon name={domein.icon} className="h-4 w-4 text-sage shrink-0" />
            <h3 className="text-sm font-semibold text-sage leading-tight flex-1">{sectie.titel}</h3>
            <span className="text-xs font-medium bg-white/60 text-sage px-2 py-0.5 rounded-full">
              {sectie.velden.length}
            </span>
          </div>
          {/* CardContent: pt-5 space-y-2 text-sm */}
          <div className="pt-4 pb-4 px-4 space-y-2">
            {sectie.velden.map((veld) => (
              <Veld key={veld.label} {...veld} maskAlles={maskGevoelig} />
            ))}
          </div>
        </div>
      ))}

      {/* Read-only hint */}
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
        <Lock className="w-4 h-4 shrink-0 opacity-50" />
        In de echte app kun je hier gegevens aanpassen en aanvullen.
      </div>
    </div>
  );
}

// ── Owner dashboard (matches DashboardPage owner view) ───────────────────
function DashboardView({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="space-y-6">
      {/* Greeting — text-3xl font-bold text-primary pattern */}
      <div>
        <h1 className="text-2xl font-bold text-primary-600">Goedemiddag, Jan</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Hier vindt u een overzicht van uw profiel bij Lumio.
        </p>
      </div>

      {/* Progress widget — matches "voortgang" widget */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-primary-600">Voortgang profiel</h2>
          <span className="text-sm font-bold text-primary-600">{COMPLEETHEID.percentage}%</span>
        </div>
        <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary-600 transition-all duration-500"
            style={{ width: `${COMPLEETHEID.percentage}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {COMPLEETHEID.aantalIngevuld} van {COMPLEETHEID.totaal} secties ingevuld
        </p>
      </div>

      {/* Domain card grid — matches real app sm:grid-cols-2 lg:grid-cols-3 */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-muted-foreground">Uw secties</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {DOMEINEN.filter((d) => d.id !== "eigenaar").map((d) => {
            const cols = DOMEIN_COLORS[d.id] ?? DOMEIN_COLORS.eigenaar;
            return (
              <button
                key={d.id}
                onClick={() => onSelect(d.id)}
                className="text-left rounded-lg border border-border bg-card p-3.5 hover:shadow-md hover:border-primary-300 transition-all"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center ${cols.bgColor}`}>
                    <DomeinIcon name={d.icon} className={`w-4 h-4 ${cols.color}`} />
                  </div>
                  {d.volledig ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                  )}
                </div>
                <p className="text-xs font-medium text-foreground">{d.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {d.volledig ? "Ingevuld" : "Nog aan te vullen"}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Heir view (mirrors NabestaandenDashboard.tsx structure exactly) ───────
function ErfgenaamView() {
  const [gedaan, setGedaan] = useState<Set<string>>(new Set());
  const [openDomein, setOpenDomein] = useState<string | null>(null);

  const toggle = (key: string) =>
    setGedaan((prev) => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });

  const total = STAPPENPLAN.flatMap((f) => f.stappen).length;
  const done = gedaan.size;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="flex min-h-[580px]">
      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-border bg-sidebar">
        {/* Primary header strip */}
        <div className="bg-primary-600 px-5 py-5">
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="h-4 w-4 text-white/70" />
            <p className="text-xs text-white/70">Nabestaandenmodus</p>
          </div>
          <p className="text-sm font-semibold text-white">{ERFGENAAM_NAAM}</p>
          <p className="text-xs text-white/60 mt-1">
            Jan de Voorbeeld heeft u toegang gegeven.
          </p>
          {/* Mini progress */}
          <div className="mt-3 flex items-center gap-3 bg-white/10 rounded-lg px-3 py-2">
            <div className="flex-1">
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.2)" }}>
                <div className="h-full bg-white rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <span className="text-xs text-white/80 font-medium shrink-0">{done}/{total}</span>
          </div>
        </div>

        {/* Quick domain nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Snel opzoeken
          </p>
          {DOMEINEN.filter((d) =>
            ["noodcontacten", "testament", "boedel", "uitvaart", "erfgenamen"].includes(d.id)
          ).map((d) => {
            const cols = DOMEIN_COLORS[d.id] ?? DOMEIN_COLORS.eigenaar;
            const isOpen = openDomein === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setOpenDomein(isOpen ? null : d.id)}
                className={`w-full text-left flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isOpen ? "bg-primary-600 text-white" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <DomeinIcon
                  name={d.icon}
                  className={`w-4 h-4 shrink-0 ${isOpen ? "text-white/70" : cols.color}`}
                />
                {d.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-auto p-6 bg-background">
        {openDomein ? (
          (() => {
            const domein = DOMEINEN.find((d) => d.id === openDomein);
            if (!domein) return null;
            return (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <p className="font-semibold text-foreground">{domein.label}</p>
                  <button
                    onClick={() => setOpenDomein(null)}
                    className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <DomeinDetail domein={domein} maskGevoelig />
              </div>
            );
          })()
        ) : (
          <div className="space-y-6">
            {/* Empathetic header — matches NabestaandenDashboard rounded-lg border bg-gradient */}
            <div className="rounded-lg border border-muted bg-gradient-to-br from-muted/50 to-background p-6">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="h-5 w-5 text-muted-foreground" />
                <h1 className="text-2xl font-bold">Nabestaandenmodus</h1>
              </div>
              <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                U heeft toegang tot het profiel van Jan de Voorbeeld. Gebruik het stappenplan
                hieronder om stap voor stap de nalatenschap te regelen.
              </p>
            </div>

            {/* Quick actions — matches NabestaandenDashboard quick actions */}
            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 text-sm font-medium bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                <Download className="h-4 w-4" /> Exporteren
              </button>
              <button className="inline-flex items-center gap-2 text-sm font-medium border border-border bg-card text-foreground px-4 py-2 rounded-lg hover:bg-muted transition-colors">
                <Archive className="h-4 w-4" /> Download ZIP
              </button>
            </div>

            {/* Progress bar — matches nabestaanden voortgang widget */}
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold">Voortgang afhandeling</h2>
                <span className="text-sm font-bold text-primary-600">{pct}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary-600 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {done} van {total} taken afgehandeld
              </p>
            </div>

            {/* Stappenplan — exact faseConfig + card pattern from NabestaandenDashboard */}
            {STAPPENPLAN.map((fase) => {
              const cfgKey = fase.fase as keyof typeof FASE_CONFIG;
              const cfg = FASE_CONFIG[cfgKey] ?? FASE_CONFIG.maand1;
              const FaseIcon = cfg.Icon;
              const doneInFase = fase.stappen.filter((s) =>
                gedaan.has(`${fase.fase}-${s.label}`)
              ).length;

              return (
                <div key={fase.fase} className="space-y-3">
                  {/* Fase heading with correct color */}
                  <div className="flex items-center gap-2">
                    <FaseIcon className={`h-5 w-5 ${cfg.color}`} />
                    <h2 className={`text-lg font-semibold ${cfg.color}`}>{fase.faseLabel}</h2>
                  </div>

                  {/* Stap cards — border + bg from faseConfig */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {fase.stappen.map((stap) => {
                      const stepKey = `${fase.fase}-${stap.label}`;
                      const isDone = gedaan.has(stepKey);
                      return (
                        <div
                          key={stepKey}
                          className={`rounded-lg border ${cfg.borderColor} ${cfg.bgColor} p-4 transition-opacity ${isDone ? "opacity-70" : ""}`}
                        >
                          <div className="flex items-start gap-2.5">
                            <button
                              onClick={() => toggle(stepKey)}
                              className="mt-0.5 shrink-0"
                              aria-label={isDone ? "Markeer als open" : "Markeer als afgehandeld"}
                            >
                              {isDone ? (
                                <CheckCircle2 className="h-4 w-4 text-success" />
                              ) : (
                                <div
                                  className={`h-4 w-4 rounded-full border-2 ${cfg.color}`}
                                  style={{ borderColor: "currentColor", opacity: 0.6 }}
                                />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${cfg.color} ${isDone ? "line-through opacity-60" : ""}`}>
                                {stap.label}
                              </p>
                              {isDone && (
                                <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-success-100 text-success">
                                  <CheckCircle2 className="h-3 w-3" /> Afgehandeld
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Fase progress badge */}
                  <div className="flex justify-end">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.badgeClass}`}>
                      {doneInFase}/{fase.stappen.length} afgehandeld
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

// ── Main DemoShell ────────────────────────────────────────────────────────
export function DemoShell() {
  const [perspectief, setPerspectief] = useState<"eigenaar" | "erfgenaam">("eigenaar");
  const [activeDomein, setActiveDomein] = useState<string>("dashboard");
  const actief = DOMEINEN.find((d) => d.id === activeDomein);

  return (
    <div className="rounded-xl overflow-hidden shadow-2xl border border-border">
      {/* Demo banner */}
      <div className="text-center text-xs font-semibold py-1.5 tracking-wider uppercase bg-amber-400 text-amber-900">
        Demo · Familie de Voorbeeld · alleen fictieve data
      </div>

      {/* App header bar — matches Header.tsx bg-primary h-16 */}
      <div className="flex items-center justify-between px-5 h-14 bg-primary-600">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" width={22} height={22} className="opacity-90" />
          <span className="font-bold text-white">Lumio</span>
          <span className="text-white/40 text-sm mx-1">·</span>
          <span className="text-white/80 text-sm">
            {perspectief === "eigenaar" ? EIGENAAR_NAAM : "Nabestaandenmodus"}
          </span>
        </div>
        {/* Perspective toggle */}
        <div className="flex items-center gap-1 rounded-lg p-1 bg-black/20">
          <button
            onClick={() => { setPerspectief("eigenaar"); setActiveDomein("dashboard"); }}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors"
            style={perspectief === "eigenaar" ? { background: "#fff", color: "#355E68" } : { color: "rgba(255,255,255,0.7)" }}
          >
            <User className="w-3.5 h-3.5" /> Eigenaar
          </button>
          <button
            onClick={() => setPerspectief("erfgenaam")}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors"
            style={perspectief === "erfgenaam" ? { background: "#fff", color: "#355E68" } : { color: "rgba(255,255,255,0.7)" }}
          >
            <Users className="w-3.5 h-3.5" /> Erfgenaam
          </button>
        </div>
      </div>

      {/* Body */}
      {perspectief === "eigenaar" ? (
        <div className="flex min-h-[580px]">
          {/* Sidebar — matches Sidebar.tsx bg-sidebar, border-r, nav groups */}
          <aside className="w-56 shrink-0 flex flex-col border-r border-border bg-sidebar overflow-y-auto">
            {/* User chip */}
            <div className="px-3 py-3 border-b border-border flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 bg-primary-600">
                JV
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate text-foreground">Jan de Voorbeeld</p>
                <p className="text-xs truncate text-muted-foreground">Mijn profiel</p>
              </div>
            </div>

            {/* Nav groups with muted uppercase labels */}
            <nav className="flex-1 p-2 space-y-4">
              {NAV_GROEPEN.map((groep) => (
                <div key={groep.label}>
                  <p className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {groep.label}
                  </p>
                  <div className="space-y-0.5">
                    {groep.items.map((item) => {
                      const domeinData = DOMEINEN.find((d) => d.id === item.id);
                      const isActive = activeDomein === item.id;
                      const cols = DOMEIN_COLORS[item.id] ?? DOMEIN_COLORS.eigenaar;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveDomein(item.id)}
                          className={`w-full text-left flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                            isActive ? "bg-primary-600 text-white" : "text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          <DomeinIcon
                            name={item.icon}
                            className={`w-4 h-4 shrink-0 ${isActive ? "text-white/70" : cols.color}`}
                          />
                          <span className="flex-1 truncate">{item.label}</span>
                          {domeinData &&
                            (domeinData.volledig ? (
                              <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-white/50" : "text-success"}`} />
                            ) : (
                              <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-white/50" : "text-warning"}`} />
                            ))}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Settings footer */}
            <div className="p-2 border-t border-border">
              <div className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground">
                <Settings className="w-4 h-4 shrink-0" />
                <span>Instellingen</span>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 p-6 overflow-auto bg-background">
            {activeDomein === "dashboard" ? (
              <DashboardView onSelect={setActiveDomein} />
            ) : actief ? (
              <DomeinDetail domein={actief} />
            ) : (
              <DashboardView onSelect={setActiveDomein} />
            )}
          </main>
        </div>
      ) : (
        <ErfgenaamView />
      )}
    </div>
  );
}
