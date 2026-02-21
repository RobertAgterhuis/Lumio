"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";
import { ScrollText, Plus, Pencil, Trash2 } from "lucide-react";

interface TestamentInfo {
  id: string;
  testamentType?: string;
  notarisNaam?: string;
  notarisKantoor?: string;
  datumTestament?: string;
  ctr_Nummer?: string;
}

interface Begunstigde {
  id: string;
  naam: string;
  relatie: string;
  percentage?: number;
  isLegitiemePortie: boolean;
}

interface Executeur {
  id: string;
  naam: string;
  relatie?: string;
  telefoon?: string;
  email?: string;
  notarieleAkte?: boolean;
}

export default function TestamentPage() {
  const [testament, setTestament] = useState<TestamentInfo | null>(null);
  const [begunstigden, setBegunstigden] = useState<Begunstigde[]>([]);
  const [executeurs, setExecuteurs] = useState<Executeur[]>([]);
  const [execDialogOpen, setExecDialogOpen] = useState(false);
  const [editExecId, setEditExecId] = useState<string | null>(null);
  const [execForm, setExecForm] = useState({ naam: "", relatie: "", telefoon: "", email: "" });
  const [execError, setExecError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [t, b, e] = await Promise.all([
          api.get<TestamentInfo>("/api/testament").catch(() => null),
          api.get<Begunstigde[]>("/api/testament/begunstigden").catch(() => []),
          api.get<Executeur[]>("/api/testament/executeurs").catch(() => []),
        ]);
        setTestament(t);
        setBegunstigden(b);
        setExecuteurs(e ?? []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openExecDialog = (exec?: Executeur) => {
    setExecError(null);
    if (exec) {
      setEditExecId(exec.id);
      setExecForm({
        naam: exec.naam,
        relatie: exec.relatie ?? "",
        telefoon: exec.telefoon ?? "",
        email: exec.email ?? "",
      });
    } else {
      setEditExecId(null);
      setExecForm({ naam: "", relatie: "", telefoon: "", email: "" });
    }
    setExecDialogOpen(true);
  };

  const saveExec = async () => {
    setExecError(null);
    try {
      const payload = {
        naam: execForm.naam,
        relatie: execForm.relatie || null,
        telefoon: execForm.telefoon || null,
        email: execForm.email || null,
      };
      if (editExecId) {
        await api.put(`/api/testament/executeurs/${editExecId}`, payload);
      } else {
        await api.post("/api/testament/executeurs", payload);
      }
      setExecDialogOpen(false);
      // Reload executeurs
      const updated = await api.get<Executeur[]>("/api/testament/executeurs").catch(() => []);
      setExecuteurs(updated ?? []);
    } catch (err) {
      setExecError(err instanceof Error ? err.message : "Opslaan mislukt.");
    }
  };

  const deleteExec = async (id: string) => {
    try {
      await api.delete(`/api/testament/executeurs/${id}`);
      setExecuteurs((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setExecError(err instanceof Error ? err.message : "Verwijderen mislukt.");
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ScrollText className="h-8 w-8 text-blue-600" />
            Testament
          </h1>
          <p className="text-muted-foreground mt-1">
            Testamentaire informatie conform BW Boek 4
          </p>
        </div>
        <Link href="/testament/wizard">
          <Button>
            {testament ? <><Pencil className="h-4 w-4 mr-2" /> Bewerken</> : <><Plus className="h-4 w-4 mr-2" /> Wizard Starten</>}
          </Button>
        </Link>
      </div>

      {testament ? (
        <>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notaris Gegevens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><span className="font-medium">Type:</span> {testament.testamentType || "—"}</div>
              <div><span className="font-medium">Notaris:</span> {testament.notarisNaam || "—"}</div>
              <div><span className="font-medium">Kantoor:</span> {testament.notarisKantoor || "—"}</div>
              <div><span className="font-medium">Datum:</span> {testament.datumTestament || "—"}</div>
              <div><span className="font-medium">CTR Nummer:</span> {testament.ctr_Nummer || "—"}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Begunstigden</CardTitle>
                <Badge variant="secondary">{begunstigden.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {begunstigden.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nog geen begunstigden toegevoegd.</p>
              ) : (
                <ul className="space-y-2">
                  {begunstigden.map((b) => (
                    <li key={b.id} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium">{b.naam}</span>
                        <span className="text-muted-foreground ml-2">({b.relatie})</span>
                      </div>
                      {b.percentage && (
                        <Badge variant="outline">{b.percentage}%</Badge>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Executeurs</CardTitle>
                <Button size="sm" onClick={() => openExecDialog()}>
                  <Plus className="h-4 w-4 mr-1" /> Toevoegen
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {execError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-2 mb-3">
                  <p className="text-sm text-red-800">{execError}</p>
                </div>
              )}
              {executeurs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nog geen executeurs toegevoegd.</p>
              ) : (
                <ul className="space-y-2">
                  {executeurs.map((e) => (
                    <li key={e.id} className="flex items-center justify-between text-sm rounded-md border p-2">
                      <div>
                        <span className="font-medium">{e.naam}</span>
                        {e.relatie && <span className="text-muted-foreground ml-2">({e.relatie})</span>}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openExecDialog(e)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteExec(e.id)}>
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ScrollText className="h-12 w-12 text-muted-foreground mb-4" />
            <CardDescription className="text-center mb-4">
              U heeft nog geen testamentaire informatie vastgelegd.
              Start de wizard om stap voor stap uw wensen vast te leggen.
            </CardDescription>
            <Link href="/testament/wizard">
              <Button>Wizard Starten</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <Dialog open={execDialogOpen} onOpenChange={setExecDialogOpen}>
        <DialogHeader>
          <DialogTitle>{editExecId ? "Executeur bewerken" : "Executeur toevoegen"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Naam</Label>
            <Input
              value={execForm.naam}
              onChange={(e) => setExecForm((f) => ({ ...f, naam: e.target.value }))}
              placeholder="Naam van de executeur"
            />
          </div>
          <div className="space-y-2">
            <Label>Relatie</Label>
            <Input
              value={execForm.relatie}
              onChange={(e) => setExecForm((f) => ({ ...f, relatie: e.target.value }))}
              placeholder="bijv. Advocaat, Partner"
            />
          </div>
          <div className="space-y-2">
            <Label>Telefoon</Label>
            <Input
              value={execForm.telefoon}
              onChange={(e) => setExecForm((f) => ({ ...f, telefoon: e.target.value }))}
              placeholder="Telefoonnummer"
            />
          </div>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input
              value={execForm.email}
              onChange={(e) => setExecForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="E-mailadres"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setExecDialogOpen(false)}>Annuleren</Button>
          <Button onClick={saveExec}>Opslaan</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
