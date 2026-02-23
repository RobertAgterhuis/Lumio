"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { ClipboardList, RefreshCw, Filter } from "lucide-react";

interface AuditLogEntry {
  id: string;
  tijdstip: string;
  actie: string;
  entityType: string | null;
  entityId: string | null;
  details: string | null;
}

const actieKleuren: Record<string, string> = {
  Aangemaakt: "bg-green-100 text-green-800",
  Gewijzigd: "bg-blue-100 text-blue-800",
  Verwijderd: "bg-red-100 text-red-800",
  Ontgrendeld: "bg-emerald-100 text-emerald-800",
  Vergrendeld: "bg-amber-100 text-amber-800",
  Export: "bg-purple-100 text-purple-800",
  "Wachtwoord gewijzigd": "bg-orange-100 text-orange-800",
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

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const t = useTranslations("auditLog");
  const tEnum = useTranslations("enums");
  const locale = useLocale();

  const loadEntries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "200");
      if (filter) params.set("actie", filter);
      const data = await api.get<AuditLogEntry[]>(
        `/api/audit-log?${params.toString()}`
      );
      setEntries(data);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, [filter]);

  const uniqueActies = [
    ...new Set(entries.map((e) => e.actie)),
  ].sort();

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">{t("titel")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("beschrijving")}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("recenteActiviteiten")}</CardTitle>
              <CardDescription>
                {t("activiteitenGevonden", { aantal: entries.length })}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="rounded-md border bg-background px-3 py-1.5 text-sm"
                >
                  <option value="">{t("alleActies")}</option>
                  <option value="Aangemaakt">{tEnum("auditActie.aangemaakt")}</option>
                  <option value="Gewijzigd">{tEnum("auditActie.gewijzigd")}</option>
                  <option value="Verwijderd">{tEnum("auditActie.verwijderd")}</option>
                  <option value="Ontgrendeld">{tEnum("auditActie.ontgrendeld")}</option>
                  <option value="Vergrendeld">{tEnum("auditActie.vergrendeld")}</option>
                  <option value="Wachtwoord gewijzigd">{tEnum("auditActie.wachtwoordGewijzigd")}</option>
                  <option value="Export">{tEnum("auditActie.export")}</option>
                </select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadEntries}
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
          ) : entries.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t("geenActiviteiten")}
            </p>
          ) : (
            <div className="space-y-1">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        actieKleuren[entry.actie] ??
                        "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {tEnum(`auditActie.${ACTIE_KEYS[entry.actie] ?? entry.actie}`)}
                    </span>
                    <div>
                      <p className="text-sm font-medium">
                        {entry.details ?? entry.actie}
                      </p>
                      {entry.entityType && (
                        <p className="text-xs text-muted-foreground">
                          {entry.entityType}
                          {entry.entityId
                            ? ` — ${entry.entityId.slice(0, 8)}...`
                            : ""}
                        </p>
                      )}
                    </div>
                  </div>
                  <time className="text-xs text-muted-foreground">
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
