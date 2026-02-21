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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { api } from "@/lib/api-client";
import { Globe, Key, Bitcoin, Plus, Pencil, Trash2, Eye, EyeOff, Filter } from "lucide-react";
import { PasswordGenerator } from "@/components/PasswordGenerator";

interface DigitaalAccount {
  id: string;
  platformNaam: string;
  categorie?: string;
  gebruikersnaam?: string;
  emailAdres?: string;
  url?: string;
  gewensteActie: string;
  overdrachtAan?: string;
  notities?: string;
}

interface WachtwoordEntry {
  id: string;
  naam: string;
  gebruikersnaam?: string;
  url?: string;
  notities?: string;
}

interface CryptoWallet {
  id: string;
  walletNaam: string;
  cryptoType: string;
  walletAdres?: string;
  exchange?: string;
  notities?: string;
}

const ACCOUNT_CATEGORIEEN = [
  "Social Media",
  "Email",
  "Banking",
  "Shopping",
  "Streaming",
  "Gaming",
  "Cloud",
  "Werk",
  "Overheid",
  "Overig",
];

const emptyAccount = {
  platformNaam: "",
  categorie: "",
  gebruikersnaam: "",
  emailAdres: "",
  url: "",
  gewensteActie: "",
  overdrachtAan: "",
  notities: "",
};
const emptyWachtwoord = {
  naam: "",
  gebruikersnaam: "",
  wachtwoord: "",
  url: "",
  notities: "",
};
const emptyCrypto = {
  walletNaam: "",
  cryptoType: "",
  walletAdres: "",
  exchange: "",
  seedPhrase: "",
  notities: "",
};

export default function DigitaalBezitPage() {
  const [tab, setTab] = useState("accounts");
  const [accounts, setAccounts] = useState<DigitaalAccount[]>([]);
  const [wachtwoorden, setWachtwoorden] = useState<WachtwoordEntry[]>([]);
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [dialogType, setDialogType] = useState<
    "account" | "wachtwoord" | "crypto" | null
  >(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [accountForm, setAccountForm] = useState(emptyAccount);
  const [wachtwoordForm, setWachtwoordForm] = useState(emptyWachtwoord);
  const [cryptoForm, setCryptoForm] = useState(emptyCrypto);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ontsleuteld, setOntsleuteld] = useState<Record<string, string>>({});
  const [categorieFilter, setCategorieFilter] = useState<string>("");

  const filteredAccounts = categorieFilter
    ? accounts.filter((a) => a.categorie === categorieFilter)
    : accounts;

  const loadData = () => {
    Promise.all([
      api.get<DigitaalAccount[]>("/api/digitaal-bezit/accounts").catch(() => []),
      api.get<WachtwoordEntry[]>("/api/digitaal-bezit/wachtwoorden").catch(() => []),
      api.get<CryptoWallet[]>("/api/digitaal-bezit/crypto").catch(() => []),
    ])
      .then(([a, w, c]) => {
        setAccounts(a ?? []);
        setWachtwoorden(w ?? []);
        setWallets(c ?? []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAccountDialog = (account?: DigitaalAccount) => {
    setError(null);
    if (account) {
      setEditId(account.id);
      setAccountForm({
        platformNaam: account.platformNaam,
        categorie: account.categorie ?? "",
        gebruikersnaam: account.gebruikersnaam ?? "",
        emailAdres: account.emailAdres ?? "",
        url: account.url ?? "",
        gewensteActie: account.gewensteActie ?? "",
        overdrachtAan: account.overdrachtAan ?? "",
        notities: account.notities ?? "",
      });
    } else {
      setEditId(null);
      setAccountForm(emptyAccount);
    }
    setDialogType("account");
  };

  const openWachtwoordDialog = (w?: WachtwoordEntry) => {
    setError(null);
    if (w) {
      setEditId(w.id);
      setWachtwoordForm({
        naam: w.naam,
        gebruikersnaam: w.gebruikersnaam ?? "",
        wachtwoord: "",
        url: w.url ?? "",
        notities: w.notities ?? "",
      });
    } else {
      setEditId(null);
      setWachtwoordForm(emptyWachtwoord);
    }
    setDialogType("wachtwoord");
  };

  const openCryptoDialog = (c?: CryptoWallet) => {
    setError(null);
    if (c) {
      setEditId(c.id);
      setCryptoForm({
        walletNaam: c.walletNaam,
        cryptoType: c.cryptoType,
        walletAdres: c.walletAdres ?? "",
        exchange: c.exchange ?? "",
        seedPhrase: "",
        notities: c.notities ?? "",
      });
    } else {
      setEditId(null);
      setCryptoForm(emptyCrypto);
    }
    setDialogType("crypto");
  };

  const saveAccount = async () => {
    setError(null);
    setSaving(true);
    try {
      const payload = {
        platformNaam: accountForm.platformNaam,
        categorie: accountForm.categorie || null,
        gebruikersnaam: accountForm.gebruikersnaam || null,
        emailAdres: accountForm.emailAdres || null,
        url: accountForm.url || null,
        gewensteActie: accountForm.gewensteActie,
        overdrachtAan: accountForm.overdrachtAan || null,
        notities: accountForm.notities || null,
      };
      if (editId) {
        await api.put(`/api/digitaal-bezit/accounts/${editId}`, payload);
      } else {
        await api.post("/api/digitaal-bezit/accounts", payload);
      }
      setDialogType(null);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Opslaan mislukt.");
    } finally {
      setSaving(false);
    }
  };

  const saveWachtwoord = async () => {
    setError(null);
    setSaving(true);
    try {
      if (editId) {
        // Update uses nieuwWachtwoord (optional)
        await api.put(`/api/digitaal-bezit/wachtwoorden/${editId}`, {
          naam: wachtwoordForm.naam,
          gebruikersnaam: wachtwoordForm.gebruikersnaam || null,
          nieuwWachtwoord: wachtwoordForm.wachtwoord || null,
          url: wachtwoordForm.url || null,
          notities: wachtwoordForm.notities || null,
        });
      } else {
        // Create requires wachtwoord
        await api.post("/api/digitaal-bezit/wachtwoorden", {
          naam: wachtwoordForm.naam,
          gebruikersnaam: wachtwoordForm.gebruikersnaam || null,
          wachtwoord: wachtwoordForm.wachtwoord,
          url: wachtwoordForm.url || null,
          notities: wachtwoordForm.notities || null,
        });
      }
      setDialogType(null);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Opslaan mislukt.");
    } finally {
      setSaving(false);
    }
  };

  const saveCrypto = async () => {
    setError(null);
    setSaving(true);
    try {
      const payload = {
        walletNaam: cryptoForm.walletNaam,
        cryptoType: cryptoForm.cryptoType,
        walletAdres: cryptoForm.walletAdres || null,
        exchange: cryptoForm.exchange || null,
        seedPhrase: cryptoForm.seedPhrase || null,
        notities: cryptoForm.notities || null,
      };
      if (editId) {
        await api.put(`/api/digitaal-bezit/crypto/${editId}`, payload);
      } else {
        await api.post("/api/digitaal-bezit/crypto", payload);
      }
      setDialogType(null);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Opslaan mislukt.");
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (type: string, id: string) => {
    try {
      await api.delete(`/api/digitaal-bezit/${type}/${id}`);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verwijderen mislukt.");
    }
  };

  const handleOntsluitel = async (id: string) => {
    if (ontsleuteld[id]) {
      // Toggle off
      setOntsleuteld((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return;
    }
    try {
      const result = await api.get<{ id: string; wachtwoord: string }>(
        `/api/digitaal-bezit/wachtwoorden/${id}/ontsluitel`
      );
      setOntsleuteld((prev) => ({ ...prev, [id]: result.wachtwoord }));
      // Auto-hide after 10 seconds
      setTimeout(() => {
        setOntsleuteld((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }, 10_000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ontsluiten mislukt.");
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
        <h1 className="text-3xl font-bold">Digitaal Bezit</h1>
        <p className="text-muted-foreground mt-1">
          Online accounts, wachtwoorden en crypto wallets
        </p>
      </div>

      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="text-sm text-green-800">
          <strong>Let op:</strong> Wachtwoorden en seed phrases worden extra
          versleuteld opgeslagen (AES-256-GCM). Alleen na ontgrendeling zijn
          deze zichtbaar.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="accounts">
            <Globe className="h-4 w-4 mr-1" /> Accounts ({accounts.length})
          </TabsTrigger>
          <TabsTrigger value="wachtwoorden">
            <Key className="h-4 w-4 mr-1" /> Wachtwoorden ({wachtwoorden.length})
          </TabsTrigger>
          <TabsTrigger value="crypto">
            <Bitcoin className="h-4 w-4 mr-1" /> Crypto ({wallets.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Online Accounts</CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={categorieFilter}
                    onChange={(e) => setCategorieFilter(e.target.value)}
                    className="w-40"
                  >
                    <option value="">Alle categorieën</option>
                    {ACCOUNT_CATEGORIEEN.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Select>
                </div>
                <Button size="sm" onClick={() => openAccountDialog()}>
                  <Plus className="h-4 w-4 mr-1" /> Toevoegen
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {filteredAccounts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {categorieFilter
                    ? `Geen accounts in categorie "${categorieFilter}".`
                    : "Nog geen accounts. Klik op Toevoegen."}
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredAccounts.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <p className="font-medium text-sm">{a.platformNaam}</p>
                        {a.gebruikersnaam && (
                          <p className="text-xs text-muted-foreground">
                            {a.gebruikersnaam}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {a.categorie && (
                          <Badge variant="outline">{a.categorie}</Badge>
                        )}
                        <Badge variant="secondary">{a.gewensteActie}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openAccountDialog(a)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteItem("accounts", a.id)}
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
        </TabsContent>

        <TabsContent value="wachtwoorden">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Wachtwoorden</CardTitle>
              <Button size="sm" onClick={() => openWachtwoordDialog()}>
                <Plus className="h-4 w-4 mr-1" /> Toevoegen
              </Button>
            </CardHeader>
            <CardContent>
              {wachtwoorden.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nog geen wachtwoorden. Klik op Toevoegen.
                </p>
              ) : (
                <div className="space-y-2">
                  {wachtwoorden.map((w) => (
                    <div
                      key={w.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <p className="font-medium text-sm">{w.naam}</p>
                        {w.gebruikersnaam && (
                          <p className="text-xs text-muted-foreground">
                            {w.gebruikersnaam}
                          </p>
                        )}
                        {ontsleuteld[w.id] && (
                          <p className="text-xs font-mono bg-yellow-50 text-yellow-800 px-2 py-0.5 rounded">
                            {ontsleuteld[w.id]}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {w.url && (
                          <span className="text-xs text-muted-foreground">
                            {w.url}
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOntsluitel(w.id)}
                          title={ontsleuteld[w.id] ? "Verbergen" : "Ontsluiten"}
                        >
                          {ontsleuteld[w.id] ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openWachtwoordDialog(w)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteItem("wachtwoorden", w.id)}
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
        </TabsContent>

        <TabsContent value="crypto">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Crypto Wallets</CardTitle>
              <Button size="sm" onClick={() => openCryptoDialog()}>
                <Plus className="h-4 w-4 mr-1" /> Toevoegen
              </Button>
            </CardHeader>
            <CardContent>
              {wallets.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nog geen wallets. Klik op Toevoegen.
                </p>
              ) : (
                <div className="space-y-2">
                  {wallets.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <p className="font-medium text-sm">{c.walletNaam}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.cryptoType}
                          {c.exchange && ` \u2014 ${c.exchange}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openCryptoDialog(c)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteItem("crypto", c.id)}
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
        </TabsContent>
      </Tabs>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Account Dialog */}
      <Dialog
        open={dialogType === "account"}
        onOpenChange={() => setDialogType(null)}
      >
        <DialogHeader>
          <DialogTitle>
            {editId ? "Account bewerken" : "Account toevoegen"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Platform naam</Label>
            <Input
              value={accountForm.platformNaam}
              onChange={(e) =>
                setAccountForm((f) => ({ ...f, platformNaam: e.target.value }))
              }
              placeholder="bijv. Google, Facebook, LinkedIn"
            />
          </div>
          <div className="space-y-2">
            <Label>Categorie</Label>
            <Select
              value={accountForm.categorie}
              onChange={(e) =>
                setAccountForm((f) => ({ ...f, categorie: e.target.value }))
              }
            >
              <option value="">Selecteer categorie...</option>
              {ACCOUNT_CATEGORIEEN.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Gebruikersnaam</Label>
            <Input
              value={accountForm.gebruikersnaam}
              onChange={(e) =>
                setAccountForm((f) => ({
                  ...f,
                  gebruikersnaam: e.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>E-mailadres</Label>
            <Input
              type="email"
              value={accountForm.emailAdres}
              onChange={(e) =>
                setAccountForm((f) => ({ ...f, emailAdres: e.target.value }))
              }
              placeholder="E-mailadres gekoppeld aan dit account"
            />
          </div>
          <div className="space-y-2">
            <Label>URL</Label>
            <Input
              value={accountForm.url}
              onChange={(e) =>
                setAccountForm((f) => ({ ...f, url: e.target.value }))
              }
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label>Gewenste actie na overlijden</Label>
            <Select
              value={accountForm.gewensteActie}
              onChange={(e) =>
                setAccountForm((f) => ({
                  ...f,
                  gewensteActie: e.target.value,
                }))
              }
            >
              <option value="">Selecteer...</option>
              <option value="Verwijderen">Verwijderen</option>
              <option value="Herdenkingsstatus">Herdenkingsstatus</option>
              <option value="Overdragen">Overdragen aan erfgenaam</option>
              <option value="Geen actie">Geen actie</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Overdracht aan</Label>
            <Input
              value={accountForm.overdrachtAan}
              onChange={(e) =>
                setAccountForm((f) => ({ ...f, overdrachtAan: e.target.value }))
              }
              placeholder="Naam van de persoon (bij overdracht)"
            />
          </div>
          <div className="space-y-2">
            <Label>Notities</Label>
            <Textarea
              value={accountForm.notities}
              onChange={(e) =>
                setAccountForm((f) => ({ ...f, notities: e.target.value }))
              }
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogType(null)}>
            Annuleren
          </Button>
          <Button onClick={saveAccount} disabled={saving}>
            {saving ? "Opslaan..." : "Opslaan"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Wachtwoord Dialog */}
      <Dialog
        open={dialogType === "wachtwoord"}
        onOpenChange={() => setDialogType(null)}
      >
        <DialogHeader>
          <DialogTitle>
            {editId ? "Wachtwoord bewerken" : "Wachtwoord toevoegen"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Naam / dienst</Label>
            <Input
              value={wachtwoordForm.naam}
              onChange={(e) =>
                setWachtwoordForm((f) => ({ ...f, naam: e.target.value }))
              }
              placeholder="bijv. Gmail, DigiD"
            />
          </div>
          <div className="space-y-2">
            <Label>Gebruikersnaam</Label>
            <Input
              value={wachtwoordForm.gebruikersnaam}
              onChange={(e) =>
                setWachtwoordForm((f) => ({
                  ...f,
                  gebruikersnaam: e.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{editId ? "Nieuw wachtwoord (laat leeg om niet te wijzigen)" : "Wachtwoord"}</Label>
            <Input
              type="password"
              value={wachtwoordForm.wachtwoord}
              onChange={(e) =>
                setWachtwoordForm((f) => ({ ...f, wachtwoord: e.target.value }))
              }
              placeholder={editId ? "Laat leeg om niet te wijzigen" : "Wachtwoord"}
            />
            <PasswordGenerator
              onUse={(pw) =>
                setWachtwoordForm((f) => ({ ...f, wachtwoord: pw }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>URL</Label>
            <Input
              value={wachtwoordForm.url}
              onChange={(e) =>
                setWachtwoordForm((f) => ({ ...f, url: e.target.value }))
              }
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label>Notities</Label>
            <Textarea
              value={wachtwoordForm.notities}
              onChange={(e) =>
                setWachtwoordForm((f) => ({ ...f, notities: e.target.value }))
              }
              rows={2}
              placeholder="Hint of instructies voor nabestaanden..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogType(null)}>
            Annuleren
          </Button>
          <Button onClick={saveWachtwoord} disabled={saving}>
            {saving ? "Opslaan..." : "Opslaan"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Crypto Dialog */}
      <Dialog
        open={dialogType === "crypto"}
        onOpenChange={() => setDialogType(null)}
      >
        <DialogHeader>
          <DialogTitle>
            {editId ? "Wallet bewerken" : "Wallet toevoegen"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Wallet naam</Label>
            <Input
              value={cryptoForm.walletNaam}
              onChange={(e) =>
                setCryptoForm((f) => ({ ...f, walletNaam: e.target.value }))
              }
              placeholder="bijv. Mijn Bitcoin Wallet"
            />
          </div>
          <div className="space-y-2">
            <Label>Crypto type</Label>
            <Select
              value={cryptoForm.cryptoType}
              onChange={(e) =>
                setCryptoForm((f) => ({ ...f, cryptoType: e.target.value }))
              }
            >
              <option value="">Selecteer...</option>
              <option value="Bitcoin">Bitcoin (BTC)</option>
              <option value="Ethereum">Ethereum (ETH)</option>
              <option value="Solana">Solana (SOL)</option>
              <option value="Cardano">Cardano (ADA)</option>
              <option value="Overig">Overig</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Wallet adres (publiek)</Label>
            <Input
              value={cryptoForm.walletAdres}
              onChange={(e) =>
                setCryptoForm((f) => ({ ...f, walletAdres: e.target.value }))
              }
              placeholder="Publiek wallet adres"
            />
          </div>
          <div className="space-y-2">
            <Label>Exchange</Label>
            <Input
              value={cryptoForm.exchange}
              onChange={(e) =>
                setCryptoForm((f) => ({ ...f, exchange: e.target.value }))
              }
              placeholder="bijv. Coinbase, Binance, Bitvavo"
            />
          </div>
          <div className="space-y-2">
            <Label>Seed Phrase (optioneel)</Label>
            <Textarea
              value={cryptoForm.seedPhrase}
              onChange={(e) =>
                setCryptoForm((f) => ({ ...f, seedPhrase: e.target.value }))
              }
              placeholder="Uw seed phrase wordt versleuteld opgeslagen"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              De seed phrase wordt versleuteld opgeslagen met AES-256-GCM.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Notities</Label>
            <Textarea
              value={cryptoForm.notities}
              onChange={(e) =>
                setCryptoForm((f) => ({ ...f, notities: e.target.value }))
              }
              rows={2}
              placeholder="Instructies voor toegang, locatie seed phrase..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogType(null)}>
            Annuleren
          </Button>
          <Button onClick={saveCrypto} disabled={saving}>
            {saving ? "Opslaan..." : "Opslaan"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
