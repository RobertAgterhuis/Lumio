"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api-client";
import { Search, X } from "lucide-react";

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

const domeinKeys: (keyof ZoekResultaat)[] = [
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
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const t = useTranslations("search");
  const tc = useTranslations("common");

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Global keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (open) onClose();
        else onClose(); // toggle handled by parent
      }
      if (e.key === "Escape" && open) {
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
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.get<ZoekResultaat>(
          `/api/zoeken?q=${encodeURIComponent(query)}`
        );
        setResults(data);
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleNavigate = useCallback(
    (link: string) => {
      router.push(link);
      onClose();
    },
    [router, onClose]
  );

  const totalResults = results
    ? Object.values(results).reduce((sum, items) => sum + items.length, 0)
    : 0;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed inset-x-0 top-[15%] mx-auto w-full max-w-xl px-4">
        <div
          className="rounded-lg border bg-background shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 border-b px-4 py-3">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("placeholder")}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <kbd className="hidden rounded border bg-muted px-2 py-0.5 text-xs text-muted-foreground sm:inline-block">
              Esc
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {loading && (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                {t("laden")}
              </p>
            )}

            {!loading && query.length >= 2 && totalResults === 0 && (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                {t("geenResultaten", { query })}
              </p>
            )}

            {!loading && query.length < 2 && (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                {t("minimaalTekens")}
              </p>
            )}

            {results &&
              domeinKeys.map((domein) => {
                const items = results[domein];
                if (!items || items.length === 0) return null;
                return (
                  <div key={domein} className="mb-2">
                    <h3 className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t(`domein.${domein}`)} ({items.length})
                    </h3>
                    {items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleNavigate(item.link)}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{item.titel}</p>
                          {item.beschrijving && (
                            <p className="truncate text-xs text-muted-foreground">
                              {item.beschrijving}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {item.type}
                        </span>
                      </button>
                    ))}
                  </div>
                );
              })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
            <span>
              {totalResults > 0
                ? t("resultaten", { count: totalResults })
                : t("footer")}
            </span>
            <span className="hidden sm:inline">
              <kbd className="rounded border bg-muted px-1.5 py-0.5">Ctrl</kbd>
              {" + "}
              <kbd className="rounded border bg-muted px-1.5 py-0.5">K</kbd>
              {" "}
              {tc("omTeOpenen")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
