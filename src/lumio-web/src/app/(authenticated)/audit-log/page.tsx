"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { api } from "@/lib/api-client";
import { ClipboardList, RefreshCw, Filter, ChevronDown, Loader2 } from "lucide-react";
import { HelpButton } from "@/components/help/HelpButton";

interface AuditLogEntry {
  id: string;
  tijdstip: string;
  actie: string;
  entityType: string | null;
  entityId: string | null;
  details: string | null;
}

interface AuditLogPagedResult {
  items: AuditLogEntry[];
  heeftMeer: boolean;
}

const actieKleuren: Record<string, string> = {
  Aangemaakt: "bg-success-100 text-success",
  Gewijzigd: "bg-info-100 text-info",
  Verwijderd: "bg-danger-100 text-danger",
  DocumentGedownload: "bg-info-100 text-info",
  Ontgrendeld: "bg-success-100 text-success",
  Vergrendeld: "bg-warning-100 text-warning",
  Export: "bg-accent/10 text-accent",
  "Wachtwoord gewijzigd": "bg-warning-100 text-warning",
};

const ACTIE_KEYS: Record<string, string> = {
  Aangemaakt: "aangemaakt",
  Gewijzigd: "gewijzigd",
  Verwijderd: "verwijderd",
  Ontgrendeld: "ontgrendeld",
  Vergrendeld: "vergrendeld",
  "Wachtwoord gewijzigd": "wachtwoordGewijzigd",
  Export: "export",
};

type DateFilter = "" | "today" | "week" | "month";
const PAGE_SIZE = 50;

const DATE_FILTER_OPTIONS: { value: DateFilter; labelKey: string }[] = [
  { value: "", labelKey: "alles" },
  { value: "today", labelKey: "vandaag" },
  { value: "week", labelKey: "dezeWeek" },
  { value: "month", labelKey: "dezeMaand" },
];

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actieFilter, setActieFilter] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("");
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [heeftMeer, setHeeftMeer] = useState(false);
  const cursorRef = useRef<string | null>(null);
  const t = useTranslations("auditLog");
  const tEnum = useTranslations("enums");
  const locale = useLocale();

  const buildParams = (before?: string | null) => {
    const params = new URLSearchParams();
    params.set("limit", String(PAGE_SIZE));
    if (actieFilter) params.set("actie", actieFilter);
    const now = new Date();
    if (dateFilter === "today") {
      params.set("from", new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString());
    } else if (dateFilter === "week") {
      params.set("from", new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString());
    } else if (dateFilter === "month") {
      params.set("from", new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString());
    }
    if (before) params.set("before", before);
    return params;
  };

  const doLoad = async (reset: boolean) => {
    if (reset) {
      setLoading(true);
      setFetchError(null);
      cursorRef.current = null;
    } else {
      setLoadingMore(true);
    }
    try {
      const result = await api.get<AuditLogPagedResult>(
        `/api/audit-log?${buildParams(reset ? null : cursorRef.current).toString()}`
      );
      if (reset) {
        setEntries(result.items);
      } else {
        setEntries((prev) => [...prev, ...result.items]);
      }
      setHeeftMeer(result.heeftMeer);
      if (result.items.length > 0) {
        cursorRef.current = result.items[result.items.length - 1].tijdstip;
      }
    } catch {
      if (reset) {
        setEntries([]);
        setFetchError(t("laadFout"));
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { doLoad(true); }, [actieFilter, dateFilter]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">{t("titel")}</h1>
          <p className="text-sm text-muted-foreground">{t("beschrijving")}</p>
        </div>
        <HelpButton />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>{t("recenteActiviteiten")}</CardTitle>
              <CardDescription>
                {t("activiteitenGevonden", { aantal: entries.length })}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Date range pill buttons */}
              <div className="flex overflow-hidden rounded-md border">
                {DATE_FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDateFilter(opt.value)}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${
                      dateFilter === opt.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {t(opt.labelKey as Parameters<typeof t>[0])}
                  </button>
                ))}
              </div>
              {/* Action filter */}
              <div className="flex items-center gap-1">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={actieFilter}
                  onChange={(e) => setActieFilter(e.target.value)}
                >
                  <option value="">{t("alleActies")}</option>
                  <option value="Aangemaakt">{tEnum("auditActie.aangemaakt")}</option>
                  <option value="Gewijzigd">{tEnum("auditActie.gewijzigd")}</option>
                  <option value="Verwijderd">{tEnum("auditActie.verwijderd")}</option>
                  <option value="Ontgrendeld">{tEnum("auditActie.ontgrendeld")}</option>
                  <option value="Vergrendeld">{tEnum("auditActie.vergrendeld")}</option>
                  <option value="Wachtwoord gewijzigd">{tEnum("auditActie.wachtwoordGewijzigd")}</option>
                  <option value="Export">{tEnum("auditActie.export")}</option>
                </Select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => doLoad(true)}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {t("vernieuwen")}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t("laden")}
            </p>
          ) : fetchError ? (
            <div className="rounded-lg border border-danger bg-danger-100 p-4 my-4">
              <p className="text-sm text-danger">{fetchError}</p>
            </div>
          ) : entries.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t("geenActiviteiten")}
            </p>
          ) : (
            <>
              <div className="space-y-1">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          actieKleuren[entry.actie] ?? "bg-muted text-muted-foreground"
                        }`}
                      >
                        {entry.actie === "DocumentGedownload"
                          ? "Gedownload"
                          : tEnum(`auditActie.${ACTIE_KEYS[entry.actie] ?? entry.actie}` as Parameters<typeof tEnum>[0])}
                      </span>
                      <div>
                        <p className="text-sm font-medium">
                          {entry.details ?? entry.actie}
                        </p>
                        {entry.entityType && (
                          <p className="text-xs text-muted-foreground">
                            {entry.entityType}
                            {entry.entityId ? ` — ${entry.entityId.slice(0, 8)}...` : ""}
                          </p>
                        )}
                      </div>
                    </div>
                    <time className="whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(entry.tijdstip).toLocaleString(locale, {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                ))}
              </div>

              {heeftMeer && (
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => doLoad(false)}
                    disabled={loadingMore}
                    className="gap-2"
                  >
                    {loadingMore ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    {t("laadMeer")}
                  </Button>
                </div>
              )}
              {!heeftMeer && entries.length >= PAGE_SIZE && (
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  {t("geenMeerActiviteiten")}
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

