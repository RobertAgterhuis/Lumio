"use client";

import { useState, useEffect, useCallback, useRef, useMemo, useId } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api-client";
import {
  Search,
  X,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
  Users,
  Phone,
  Globe,
  KeyRound,
  Bitcoin,
  Package,
  Landmark,
  Shield,
  CreditCard,
  FileText,
  Loader2,
  Clock,
  ArrowRight,
  SearchX,
  Sparkles,
} from "lucide-react";

/* ────────────────────────────── Types ────────────────────────────── */

interface ZoekItem {
  id: string;
  titel: string;
  type: string;
  beschrijving: string;
  link: string;
}

interface ZoekResultaat {
  erfgenamen: ZoekItem[];
  noodcontacten: ZoekItem[];
  digitaleAccounts: ZoekItem[];
  wachtwoorden: ZoekItem[];
  cryptoWallets: ZoekItem[];
  bezittingen: ZoekItem[];
  bankrekeningen: ZoekItem[];
  verzekeringen: ZoekItem[];
  schulden: ZoekItem[];
  documenten: ZoekItem[];
}

type DomeinKey = keyof ZoekResultaat;

/* ────────────────────────────── Quick actions ────────────────────── */

interface QuickAction {
  id: string;
  labelKey: string;
  href: string;
  icon: typeof Users;
}

const quickActions: QuickAction[] = [
  { id: "erfgenamen", labelKey: "erfgenamen", href: "/erfgenamen", icon: Users },
  { id: "noodcontacten", labelKey: "noodcontacten", href: "/noodcontacten", icon: Phone },
  { id: "digitaalBezit", labelKey: "digitaalBezit", href: "/digitaal-bezit", icon: Globe },
  { id: "boedel", labelKey: "boedel", href: "/boedel", icon: Package },
  { id: "documenten", labelKey: "documenten", href: "/documenten", icon: FileText },
  { id: "testament", labelKey: "testament", href: "/testament", icon: FileText },
];

/* ────────────────────────────── Domain metadata ─────────────────── */

const domeinIcons: Record<DomeinKey, typeof Users> = {
  erfgenamen: Users,
  noodcontacten: Phone,
  digitaleAccounts: Globe,
  wachtwoorden: KeyRound,
  cryptoWallets: Bitcoin,
  bezittingen: Package,
  bankrekeningen: Landmark,
  verzekeringen: Shield,
  schulden: CreditCard,
  documenten: FileText,
};

const domeinOrder: DomeinKey[] = [
  "erfgenamen",
  "noodcontacten",
  "digitaleAccounts",
  "wachtwoorden",
  "cryptoWallets",
  "bezittingen",
  "bankrekeningen",
  "verzekeringen",
  "schulden",
  "documenten",
];

/* ────────────────────────────── Highlight helper ─────────────────── */

function highlightMatch(text: string, query: string) {
  if (!query || query.length < 2) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="rounded-sm bg-primary-100 text-primary-700 px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

/* ────────────────────────────── Recent searches ─────────────────── */

const RECENT_KEY = "lumio-recent-searches";
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addRecentSearch(query: string) {
  try {
    const recent = getRecentSearches().filter((q) => q !== query);
    recent.unshift(query);
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
  } catch {
    // localStorage not available
  }
}

/* ────────────────────────────── Flattened result item ────────────── */

interface FlatItem {
  kind: "result";
  domein: DomeinKey;
  item: ZoekItem;
}

interface FlatQuickAction {
  kind: "quick";
  action: QuickAction;
}

interface FlatRecent {
  kind: "recent";
  query: string;
}

type FlatEntry = FlatItem | FlatQuickAction | FlatRecent;

/* ────────────────────────────── Component ────────────────────────── */

export function SearchDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ZoekResultaat | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const t = useTranslations("search");
  const tn = useTranslations("nav");
  const idPrefix = useId();
  const listboxId = `${idPrefix}-listbox`;
  const optionId = (idx: number) => `${idPrefix}-option-${idx}`;

  // Build flat list for keyboard nav
  const flatList = useMemo<FlatEntry[]>(() => {
    if (query.length >= 2 && results) {
      const items: FlatEntry[] = [];
      for (const domein of domeinOrder) {
        const arr = results[domein];
        if (arr?.length) {
          for (const item of arr) {
            items.push({ kind: "result", domein, item });
          }
        }
      }
      return items;
    }
    if (query.length < 2) {
      const entries: FlatEntry[] = [];
      for (const q of recentSearches) {
        entries.push({ kind: "recent", query: q });
      }
      for (const action of quickActions) {
        entries.push({ kind: "quick", action });
      }
      return entries;
    }
    return [];
  }, [query, results, recentSearches]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults(null);
      setActiveIndex(0);
      setRecentSearches(getRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      setActiveIndex(0);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.get<ZoekResultaat>(
          `/api/zoeken?q=${encodeURIComponent(query)}`
        );
        setResults(data);
        setActiveIndex(0);
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const active = listRef.current.querySelector("[data-active='true']");
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const handleNavigate = useCallback(
    (link: string) => {
      if (query.length >= 2) addRecentSearch(query);
      router.push(link);
      onClose();
    },
    [router, onClose, query]
  );

  const handleSelect = useCallback(() => {
    const entry = flatList[activeIndex];
    if (!entry) return;
    if (entry.kind === "result") handleNavigate(entry.item.link);
    else if (entry.kind === "quick") handleNavigate(entry.action.href);
    else if (entry.kind === "recent") setQuery(entry.query);
  }, [flatList, activeIndex, handleNavigate]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, flatList.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleSelect();
      }
    },
    [flatList.length, handleSelect]
  );

  const totalResults = results
    ? Object.values(results).reduce((sum, items) => sum + items.length, 0)
    : 0;

  if (!open) return null;

  // Track flat index for rendering
  let flatIndex = 0;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-x-0 top-[12%] mx-auto w-full max-w-2xl px-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("placeholder")}
          className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl ring-1 ring-black/5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Search Input ── */}
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            {loading ? (
              <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
            ) : (
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
            )}
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("placeholder")}
              role="combobox"
              aria-expanded={flatList.length > 0}
              aria-controls={listboxId}
              aria-activedescendant={flatList.length > 0 ? optionId(activeIndex) : undefined}
              aria-autocomplete="list"
              className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/60"
              autoComplete="off"
              spellCheck={false}
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <kbd className="hidden shrink-0 rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground sm:inline-block">
              Esc
            </kbd>
          </div>

          {/* ── Results area ── */}
          <div
            ref={listRef}
            id={listboxId}
            role="listbox"
            className="max-h-[60vh] overflow-y-auto overscroll-contain scroll-smooth"
          >
            {/* Empty state: quick actions + recent */}
            {query.length < 2 && (
              <div className="p-2">
                {/* Recent searches */}
                {recentSearches.length > 0 && (
                  <div className="mb-1">
                    <div className="flex items-center gap-2 px-3 py-2">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("recent")}
                      </span>
                    </div>
                    {recentSearches.map((q) => {
                      const idx = flatIndex++;
                      return (
                        <button
                          key={`recent-${q}`}
                          id={optionId(idx)}
                          role="option"
                          aria-selected={idx === activeIndex}
                          data-active={idx === activeIndex}
                          onClick={() => setQuery(q)}
                          onMouseEnter={() => setActiveIndex(idx)}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                            idx === activeIndex
                              ? "bg-primary-100 text-primary-700"
                              : "text-foreground hover:bg-muted"
                          }`}
                        >
                          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="flex-1 truncate">{q}</span>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Quick actions */}
                <div>
                  <div className="flex items-center gap-2 px-3 py-2">
                    <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("snelNavigatie")}
                    </span>
                  </div>
                  {quickActions.map((action) => {
                    const idx = flatIndex++;
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.id}
                        id={optionId(idx)}
                        role="option"
                        aria-selected={idx === activeIndex}
                        data-active={idx === activeIndex}
                        onClick={() => handleNavigate(action.href)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                          idx === activeIndex
                            ? "bg-primary-100 text-primary-700"
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            idx === activeIndex
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="flex-1 font-medium">
                          {tn(action.labelKey)}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Loading skeleton */}
            {loading && query.length >= 2 && (
              <div className="space-y-2 p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="h-8 w-8 rounded-lg bg-muted" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-4 w-2/3 rounded bg-muted" />
                      <div className="h-3 w-1/2 rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No results */}
            {!loading && query.length >= 2 && totalResults === 0 && (
              <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted" style={{ animation: "bounceIn 0.4s ease-out" }}>
                  <SearchX className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {t("geenResultaten", { query })}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("geenResultatenTip")}
                  </p>
                </div>
              </div>
            )}

            {/* Search results grouped by domain */}
            {!loading && query.length >= 2 && results && totalResults > 0 && (
              <div className="p-2">
                {domeinOrder.map((domein) => {
                  const items = results[domein];
                  if (!items?.length) return null;
                  const DomeinIcon = domeinIcons[domein];
                  return (
                    <div key={domein} className="mb-1">
                      <div className="flex items-center gap-2 px-3 py-2">
                        <DomeinIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {t(`domein.${domein}`)}
                        </span>
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                          {items.length}
                        </span>
                      </div>
                      {items.map((item, itemIdx) => {
                        const idx = flatIndex++;
                        return (
                          <button
                            key={item.id}
                            id={optionId(idx)}
                            role="option"
                            aria-selected={idx === activeIndex}
                            data-active={idx === activeIndex}
                            onClick={() => handleNavigate(item.link)}
                            onMouseEnter={() => setActiveIndex(idx)}
                            style={{ animationDelay: `${itemIdx * 30}ms` }}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors animate-[fadeSlideIn_200ms_ease-out_both] ${
                              idx === activeIndex
                                ? "bg-primary-100 text-primary-700"
                                : "text-foreground hover:bg-muted"
                            }`}
                          >
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                idx === activeIndex
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <DomeinIcon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium leading-tight">
                                {highlightMatch(item.titel, query)}
                              </p>
                              {item.beschrijving && (
                                <p className="truncate text-xs text-muted-foreground mt-0.5">
                                  {highlightMatch(item.beschrijving, query)}
                                </p>
                              )}
                            </div>
                            <span
                              className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${
                                idx === activeIndex
                                  ? "bg-primary-700/10 text-primary-700"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {item.type}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between border-t border-border bg-muted/30 px-5 py-2.5">
            <span className="text-xs text-muted-foreground">
              {totalResults > 0
                ? t("resultaten", { count: totalResults })
                : t("footer")}
            </span>
            <div className="hidden items-center gap-3 text-xs text-muted-foreground sm:flex">
              <span className="flex items-center gap-1">
                <kbd className="inline-flex h-5 items-center rounded border border-border bg-card px-1.5 font-mono text-xs">
                  <ArrowUp className="h-2.5 w-2.5" />
                </kbd>
                <kbd className="inline-flex h-5 items-center rounded border border-border bg-card px-1.5 font-mono text-xs">
                  <ArrowDown className="h-2.5 w-2.5" />
                </kbd>
                {t("navigeer")}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="inline-flex h-5 items-center rounded border border-border bg-card px-1.5 font-mono text-xs">
                  <CornerDownLeft className="h-2.5 w-2.5" />
                </kbd>
                {t("openen")}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="inline-flex h-5 items-center rounded border border-border bg-card px-1.5 font-mono text-xs">
                  Esc
                </kbd>
                {t("sluiten")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
