"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { api } from "@/lib/api-client";
import { Phone, Plus, Pencil, Trash2 } from "lucide-react";

interface Noodcontact {
  id: string;
  naam: string;
  relatie: string;
  telefoon?: string;
  email?: string;
  adres?: string;
  postcode?: string;
  woonplaats?: string;
  rol: string;
  instructies?: string;
}

const ROLLEN = [
  "Vertrouwenspersoon",
  "Huisarts",
  "Notaris",
  "Uitvaartondernemer",
  "Advocaat",
  "Financieel adviseur",
  "Overig",
];

const emptyForm = {
  naam: "",
  relatie: "",
  telefoon: "",
  email: "",
  adres: "",
  postcode: "",
  woonplaats: "",
  rol: "",
  instructies: "",
};

export default function NoodcontactenPage() {
  const [contacten, setContacten] = useState<Noodcontact[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    api
      .get<Noodcontact[]>("/api/noodcontacten")
      .then((data) => setContacten(data ?? []))
      .catch(() => setContacten([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openDialog = (c?: Noodcontact) => {
    setError(null);
    if (c) {
      setEditId(c.id);
      setForm({
        naam: c.naam,
        relatie: c.relatie,
        telefoon: c.telefoon ?? "",
        email: c.email ?? "",
        adres: c.adres ?? "",
        postcode: c.postcode ?? "",
        woonplaats: c.woonplaats ?? "",
        rol: c.rol,
        instructies: c.instructies ?? "",
      });
    } else {
      setEditId(null);
      setForm(emptyForm);
    }
    setDialogOpen(true);
  };

  const save = async () => {
    setError(null);
    setSaving(true);
    try {
      const payload = {
        naam: form.naam,
        relatie: form.relatie,
        telefoon: form.telefoon || null,
        email: form.email || null,
        adres: form.adres || null,
        postcode: form.postcode || null,
        woonplaats: form.woonplaats || null,
        rol: form.rol,
        instructies: form.instructies || null,
      };
      if (editId) {
        await api.put(`/api/noodcontacten/${editId}`, payload);
      } else {
        await api.post("/api/noodcontacten", payload);
      }
      setDialogOpen(false);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Opslaan mislukt.");
    } finally {
      setSaving(false);
    }
  };

  const deleteContact = async (id: string) => {
    try {
      await api.delete(`/api/noodcontacten/${id}`);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verwijderen mislukt.");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Laden...</p>
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Noodcontacten</h1>
        <p className="text-muted-foreground mt-1">
          Personen die in een noodsituatie moeten worden gecontacteerd
        </p>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Voeg hier uw huisarts, notaris, uitvaartondernemer en
          vertrouwenspersonen toe. Deze contacten worden opgenomen in uw noodkaart PDF.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Contacten ({contacten.length})</CardTitle>
          <Button size="sm" onClick={() => openDialog()}>
            <Plus className="h-4 w-4 mr-1" /> Toevoegen
          </Button>
        </CardHeader>
        <CardContent>
          {contacten.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nog geen noodcontacten. Klik op Toevoegen.
            </p>
          ) : (
            <div className="space-y-2">
              {contacten.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{c.naam}</p>
                      <Badge variant="outline">{c.rol}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {c.relatie}
                      {c.telefoon && ` — ${c.telefoon}`}
                      {c.email && ` — ${c.email}`}
                    </p>
                    {c.instructies && (
                      <p className="text-xs text-muted-foreground italic">
                        {c.instructies}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {c.telefoon && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {c.telefoon}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDialog(c)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteContact(c.id)}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={() => setDialogOpen(false)}>
        <DialogHeader>
          <DialogTitle>
            {editId ? "Noodcontact bewerken" : "Noodcontact toevoegen"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Naam *</Label>
              <Input
                value={form.naam}
                onChange={(e) => setForm((f) => ({ ...f, naam: e.target.value }))}
                placeholder="Volledige naam"
              />
            </div>
            <div className="space-y-2">
              <Label>Relatie *</Label>
              <Input
                value={form.relatie}
                onChange={(e) => setForm((f) => ({ ...f, relatie: e.target.value }))}
                placeholder="bijv. Partner, Ouder, Vriend"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Rol *</Label>
            <Select
              value={form.rol}
              onChange={(e) => setForm((f) => ({ ...f, rol: e.target.value }))}
            >
              <option value="">Selecteer rol...</option>
              {ROLLEN.map((rol) => (
                <option key={rol} value={rol}>{rol}</option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Telefoon</Label>
              <Input
                value={form.telefoon}
                onChange={(e) => setForm((f) => ({ ...f, telefoon: e.target.value }))}
                placeholder="06-12345678"
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="email@voorbeeld.nl"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Adres</Label>
            <Input
              value={form.adres}
              onChange={(e) => setForm((f) => ({ ...f, adres: e.target.value }))}
              placeholder="Straat en huisnummer"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Postcode</Label>
              <Input
                value={form.postcode}
                onChange={(e) => setForm((f) => ({ ...f, postcode: e.target.value }))}
                placeholder="1234 AB"
              />
            </div>
            <div className="space-y-2">
              <Label>Woonplaats</Label>
              <Input
                value={form.woonplaats}
                onChange={(e) => setForm((f) => ({ ...f, woonplaats: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Instructies</Label>
            <Textarea
              value={form.instructies}
              onChange={(e) => setForm((f) => ({ ...f, instructies: e.target.value }))}
              rows={3}
              placeholder="Speciale instructies voor nabestaanden bij contact met deze persoon..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            Annuleren
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Opslaan..." : "Opslaan"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
