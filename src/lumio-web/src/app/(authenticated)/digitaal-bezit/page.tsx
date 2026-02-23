"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
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
import { Globe, Key, Bitcoin, Plus, Pencil, Trash2, Eye, EyeOff, Filter, Upload, Loader2, ExternalLink, Info } from "lucide-react";
import { PasswordGenerator } from "@/components/PasswordGenerator";
import { VoorbeeldDialog } from "@/components/VoorbeeldDialog";
import {
  zoekAfsluitInstructie,
  zoekAfsluitInstructiesVoorCategorie,
  type AfsluitInstructie,
} from "@/lib/afsluit-instructies";
import { SectieNotitie } from "@/components/notities/SectieNotitie";

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

const CATEGORIE_KEYS: Record<string, string> = {
  "Social Media": "socialMedia",
  "Email": "email",
  "Banking": "banking",
  "Shopping": "shopping",
  "Streaming": "streaming",
  "Gaming": "gaming",
  "Cloud": "cloud",
  "Werk": "werk",
  "Overheid": "overheid",
  "Overig": "overig",
};

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
  const t = useTranslations("digitaalBezit");
  const tEnum = useTranslations("enums");
  const tAfsluit = useTranslations("afsluitInstructies");
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
  const [importOpen, setImportOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    geimporteerd: number;
    fouten: number;
    details: string[];
  } | null>(null);
  const importFileRef = React.useRef<HTMLInputElement>(null);

  /** Expanded account IDs for showing afsluit-instructies */
  const [instructieOpen, setInstructieOpen] = useState<Record<string, boolean>>({});

  const toggleInstructie = (id: string) =>
    setInstructieOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  /** Find closure instruction for a given account */
  const getInstructie = (account: DigitaalAccount): AfsluitInstructie | undefined => {
    const direct = zoekAfsluitInstructie(account.platformNaam);
    if (direct) return direct;
    if (account.categorie) {
      const catResults = zoekAfsluitInstructiesVoorCategorie(account.categorie);
      return catResults.length > 0 ? catResults[0] : undefined;
    }
    return undefined;
  };

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
      setError(err instanceof Error ? err.message : t("opslaanMislukt"));
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
      setError(err instanceof Error ? err.message : t("opslaanMislukt"));
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
      setError(err instanceof Error ? err.message : t("opslaanMislukt"));
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (type: string, id: string) => {
    try {
      await api.delete(`/api/digitaal-bezit/${type}/${id}`);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("verwijderenMislukt"));
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
      setError(err instanceof Error ? err.message : t("ontsluitenMislukt"));
    }
  };

  const handleImport = async () => {
    const file = importFileRef.current?.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("bestand", file);
      const result = await api.upload<{
        geimporteerd: number;
        fouten: number;
        details: string[];
      }>("/api/digitaal-bezit/wachtwoorden/importeren", formData);
      setImportResult(result);
      if (result.geimporteerd > 0) loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("importerenMislukt"));
    } finally {
      setImporting(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{t("laden")}</p>
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("titel")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("beschrijving")}
        </p>
        <VoorbeeldDialog domein="digitaal-bezit" />
        <SectieNotitie sectie="digitaal-bezit" />
      </div>

      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="text-sm text-green-800">
          <strong>{t("beveiligingsTipLabel")}</strong> {t("beveiligingsTip")}
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="accounts">
            <Globe className="h-4 w-4 mr-1" /> {t("tabs.accounts", { aantal: accounts.length })}
          </TabsTrigger>
          <TabsTrigger value="wachtwoorden">
            <Key className="h-4 w-4 mr-1" /> {t("tabs.wachtwoorden", { aantal: wachtwoorden.length })}
          </TabsTrigger>
          <TabsTrigger value="crypto">
            <Bitcoin className="h-4 w-4 mr-1" /> {t("tabs.crypto", { aantal: wallets.length })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("accounts.titel")}</CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={categorieFilter}
                    onChange={(e) => setCategorieFilter(e.target.value)}
                    className="w-40"
                  >
                    <option value="">{tEnum("accountCategorie.alle")}</option>
                    {ACCOUNT_CATEGORIEEN.map((cat) => (
                      <option key={cat} value={cat}>{tEnum(`accountCategorie.${CATEGORIE_KEYS[cat]}`)}</option>
                    ))}
                  </Select>
                </div>
                <Button size="sm" onClick={() => openAccountDialog()}>
                  <Plus className="h-4 w-4 mr-1" /> {t("toevoegen")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {filteredAccounts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {categorieFilter
                    ? t("accounts.geenInCategorie", { categorie: tEnum(`accountCategorie.${CATEGORIE_KEYS[categorieFilter]}`) })
                    : t("accounts.geenAccounts")}
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredAccounts.map((a) => {
                    const instructie = getInstructie(a);
                    return (
                    <div key={a.id} className="rounded-md border">
                      <div className="flex items-center justify-between p-3">
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
                          {instructie && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleInstructie(a.id)}
                              title="Afsluitinstructies"
                            >
                              <Info className={`h-3 w-3 ${instructieOpen[a.id] ? "text-blue-600" : ""}`} />
                            </Button>
                          )}
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
                      {instructie && instructieOpen[a.id] && (
                        <div className="border-t bg-blue-50 px-3 py-2">
                          <p className="text-xs font-medium text-blue-900 mb-1">
                            {t("accounts.afsluitInstructies", { platform: instructie.platform })}
                          </p>
                          <p className="text-xs text-blue-800">
                            {tAfsluit(instructie.beschrijvingKey)}
                          </p>
                          <a
                            href={instructie.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {t("accounts.bekijkInstructies")}
                          </a>
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wachtwoorden">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("wachtwoorden.titel")}</CardTitle>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => { setImportOpen(true); setImportResult(null); }}>
                  <Upload className="h-4 w-4 mr-1" /> {t("wachtwoorden.importeren")}
                </Button>
                <Button size="sm" onClick={() => openWachtwoordDialog()}>
                  <Plus className="h-4 w-4 mr-1" /> {t("toevoegen")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {wachtwoorden.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t("wachtwoorden.geenWachtwoorden")}
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
                          title={ontsleuteld[w.id] ? t("wachtwoorden.verbergen") : t("wachtwoorden.ontsluiten")}
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
              <CardTitle>{t("crypto.titel")}</CardTitle>
              <Button size="sm" onClick={() => openCryptoDialog()}>
                <Plus className="h-4 w-4 mr-1" /> {t("toevoegen")}
              </Button>
            </CardHeader>
            <CardContent>
              {wallets.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t("crypto.geenWallets")}
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
            {editId ? t("accountDialog.bewerken") : t("accountDialog.toevoegen")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t("accountDialog.platformNaam")}</Label>
            <Input
              value={accountForm.platformNaam}
              onChange={(e) =>
                setAccountForm((f) => ({ ...f, platformNaam: e.target.value }))
              }
              placeholder={t("accountDialog.platformPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("accountDialog.categorie")}</Label>
            <Select
              value={accountForm.categorie}
              onChange={(e) =>
                setAccountForm((f) => ({ ...f, categorie: e.target.value }))
              }
            >
              <option value="">{tEnum("accountCategorie.selecteer")}</option>
              {ACCOUNT_CATEGORIEEN.map((cat) => (
                <option key={cat} value={cat}>{tEnum(`accountCategorie.${CATEGORIE_KEYS[cat]}`)}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("accountDialog.gebruikersnaam")}</Label>
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
            <Label>{t("accountDialog.email")}</Label>
            <Input
              type="email"
              value={accountForm.emailAdres}
              onChange={(e) =>
                setAccountForm((f) => ({ ...f, emailAdres: e.target.value }))
              }
              placeholder={t("accountDialog.emailPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("accountDialog.url")}</Label>
            <Input
              value={accountForm.url}
              onChange={(e) =>
                setAccountForm((f) => ({ ...f, url: e.target.value }))
              }
              placeholder={t("accountDialog.urlPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("accountDialog.gewensteActie")}</Label>
            <Select
              value={accountForm.gewensteActie}
              onChange={(e) =>
                setAccountForm((f) => ({
                  ...f,
                  gewensteActie: e.target.value,
                }))
              }
            >
              <option value="">{tEnum("gewensteActie.selecteer")}</option>
              <option value="Verwijderen">{tEnum("gewensteActie.verwijderen")}</option>
              <option value="Herdenkingsstatus">{tEnum("gewensteActie.herdenkingsstatus")}</option>
              <option value="Overdragen">{tEnum("gewensteActie.overdragen")}</option>
              <option value="Geen actie">{tEnum("gewensteActie.geenActie")}</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("accountDialog.overdrachtAan")}</Label>
            <Input
              value={accountForm.overdrachtAan}
              onChange={(e) =>
                setAccountForm((f) => ({ ...f, overdrachtAan: e.target.value }))
              }
              placeholder={t("accountDialog.overdrachtPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("accountDialog.notities")}</Label>
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
            {t("annuleren")}
          </Button>
          <Button onClick={saveAccount} disabled={saving}>
            {saving ? t("opslaanBezig") : t("opslaan")}
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
            {editId ? t("wachtwoordDialog.bewerken") : t("wachtwoordDialog.toevoegen")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t("wachtwoordDialog.naam")}</Label>
            <Input
              value={wachtwoordForm.naam}
              onChange={(e) =>
                setWachtwoordForm((f) => ({ ...f, naam: e.target.value }))
              }
              placeholder={t("wachtwoordDialog.naamPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("wachtwoordDialog.gebruikersnaam")}</Label>
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
            <Label>{editId ? t("wachtwoordDialog.nieuwWachtwoord") : t("wachtwoordDialog.wachtwoord")}</Label>
            <Input
              type="password"
              value={wachtwoordForm.wachtwoord}
              onChange={(e) =>
                setWachtwoordForm((f) => ({ ...f, wachtwoord: e.target.value }))
              }
              placeholder={editId ? t("wachtwoordDialog.nieuwWachtwoordPlaceholder") : t("wachtwoordDialog.wachtwoordPlaceholder")}
            />
            <PasswordGenerator
              onUse={(pw) =>
                setWachtwoordForm((f) => ({ ...f, wachtwoord: pw }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t("wachtwoordDialog.url")}</Label>
            <Input
              value={wachtwoordForm.url}
              onChange={(e) =>
                setWachtwoordForm((f) => ({ ...f, url: e.target.value }))
              }
              placeholder={t("wachtwoordDialog.urlPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("wachtwoordDialog.notities")}</Label>
            <Textarea
              value={wachtwoordForm.notities}
              onChange={(e) =>
                setWachtwoordForm((f) => ({ ...f, notities: e.target.value }))
              }
              rows={2}
              placeholder={t("wachtwoordDialog.notitiesPlaceholder")}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogType(null)}>
            {t("annuleren")}
          </Button>
          <Button onClick={saveWachtwoord} disabled={saving}>
            {saving ? t("opslaanBezig") : t("opslaan")}
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
            {editId ? t("cryptoDialog.bewerken") : t("cryptoDialog.toevoegen")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t("cryptoDialog.walletNaam")}</Label>
            <Input
              value={cryptoForm.walletNaam}
              onChange={(e) =>
                setCryptoForm((f) => ({ ...f, walletNaam: e.target.value }))
              }
              placeholder={t("cryptoDialog.walletPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("cryptoDialog.cryptoType")}</Label>
            <Select
              value={cryptoForm.cryptoType}
              onChange={(e) =>
                setCryptoForm((f) => ({ ...f, cryptoType: e.target.value }))
              }
            >
              <option value="">{tEnum("cryptoType.selecteer")}</option>
              <option value="Bitcoin">{tEnum("cryptoType.bitcoin")}</option>
              <option value="Ethereum">{tEnum("cryptoType.ethereum")}</option>
              <option value="Solana">{tEnum("cryptoType.solana")}</option>
              <option value="Cardano">{tEnum("cryptoType.cardano")}</option>
              <option value="Overig">{tEnum("cryptoType.overig")}</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("cryptoDialog.walletAdres")}</Label>
            <Input
              value={cryptoForm.walletAdres}
              onChange={(e) =>
                setCryptoForm((f) => ({ ...f, walletAdres: e.target.value }))
              }
              placeholder={t("cryptoDialog.walletAdresPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("cryptoDialog.exchange")}</Label>
            <Input
              value={cryptoForm.exchange}
              onChange={(e) =>
                setCryptoForm((f) => ({ ...f, exchange: e.target.value }))
              }
              placeholder={t("cryptoDialog.exchangePlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("cryptoDialog.seedPhrase")}</Label>
            <Textarea
              value={cryptoForm.seedPhrase}
              onChange={(e) =>
                setCryptoForm((f) => ({ ...f, seedPhrase: e.target.value }))
              }
              placeholder={t("cryptoDialog.seedPhrasePlaceholder")}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {t("cryptoDialog.seedPhraseInfo")}
            </p>
          </div>
          <div className="space-y-2">
            <Label>{t("cryptoDialog.notities")}</Label>
            <Textarea
              value={cryptoForm.notities}
              onChange={(e) =>
                setCryptoForm((f) => ({ ...f, notities: e.target.value }))
              }
              rows={2}
              placeholder={t("cryptoDialog.notitiesPlaceholder")}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogType(null)}>
            {t("annuleren")}
          </Button>
          <Button onClick={saveCrypto} disabled={saving}>
            {saving ? t("opslaanBezig") : t("opslaan")}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Import Wachtwoorden Dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogHeader>
          <DialogTitle>{t("importDialog.titel")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-sm text-blue-800"
              dangerouslySetInnerHTML={{ __html: t.raw("importDialog.info") }}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("importDialog.csvBestand")}</Label>
            <Input ref={importFileRef} type="file" accept=".csv" />
          </div>
          {importResult && (
            <div
              className={`rounded-lg border p-3 ${
                importResult.fouten > 0
                  ? "border-amber-200 bg-amber-50"
                  : "border-green-200 bg-green-50"
              }`}
            >
              <p className="text-sm font-medium">
                {importResult.fouten > 0
                  ? t("importDialog.resultaatMetFouten", {
                      geimporteerd: importResult.geimporteerd,
                      fouten: importResult.fouten,
                    })
                  : t("importDialog.resultaat", {
                      geimporteerd: importResult.geimporteerd,
                    })}
              </p>
              {importResult.details.length > 0 && (
                <ul className="mt-1 text-xs text-muted-foreground list-disc list-inside">
                  {importResult.details.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setImportOpen(false)}>
            {t("importDialog.sluiten")}
          </Button>
          <Button onClick={handleImport} disabled={importing}>
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t("importDialog.importerenBezig")}
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" /> {t("importDialog.importerenKnop")}
              </>
            )}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
