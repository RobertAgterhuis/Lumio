"use client";

import { useState, useEffect } from "react";
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

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");

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
          <h1 className="text-2xl font-bold">Activiteitenlogboek</h1>
          <p className="text-sm text-muted-foreground">
            Overzicht van alle acties die in uw nalatenschap zijn uitgevoerd
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recente activiteiten</CardTitle>
              <CardDescription>
                {entries.length} activiteiten gevonden
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
                  <option value="">Alle acties</option>
                  <option value="Aangemaakt">Aangemaakt</option>
                  <option value="Gewijzigd">Gewijzigd</option>
                  <option value="Verwijderd">Verwijderd</option>
                  <option value="Ontgrendeld">Ontgrendeld</option>
                  <option value="Vergrendeld">Vergrendeld</option>
                  <option value="Wachtwoord gewijzigd">Wachtwoord gewijzigd</option>
                  <option value="Export">Export</option>
                </select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadEntries}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Vernieuwen
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Laden...
            </p>
          ) : entries.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nog geen activiteiten geregistreerd.
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
                      {entry.actie}
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
                    {new Date(entry.tijdstip).toLocaleString("nl-NL", {
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
