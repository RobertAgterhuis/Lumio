"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "@/stores/toastStore";
import { api } from "@/lib/api-client";
import type {
  DigitaalAccount,
  WachtwoordEntry,
  CryptoWallet,
  AccountFormData,
  WachtwoordFormData,
  CryptoFormData,
  ImportResult,
} from "./types";
import { emptyAccountForm, emptyWachtwoordForm, emptyCryptoForm } from "./constants";

export type DialogType = "account" | "wachtwoord" | "crypto" | null;

export function useDigitaalBezit(tf: (key: string) => string, t: (key: string) => string) {
  // Data state
  const [accounts, setAccounts] = useState<DigitaalAccount[]>([]);
  const [wachtwoorden, setWachtwoorden] = useState<WachtwoordEntry[]>([]);
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [accountForm, setAccountForm] = useState<AccountFormData>(emptyAccountForm);
  const [wachtwoordForm, setWachtwoordForm] = useState<WachtwoordFormData>(emptyWachtwoordForm);
  const [cryptoForm, setCryptoForm] = useState<CryptoFormData>(emptyCryptoForm);
  const [saving, setSaving] = useState(false);

  // Password reveal state
  const [ontsleuteld, setOntsleuteld] = useState<Record<string, string>>({});

  // Import state
  const [importOpen, setImportOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(() => {
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
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Dialog openers
  const openAccountDialog = useCallback((account?: DigitaalAccount) => {
    setError(null);
    setEditId(account?.id ?? null);
    setAccountForm(account ? {
      platformNaam: account.platformNaam,
      categorie: account.categorie ?? "",
      gebruikersnaam: account.gebruikersnaam ?? "",
      emailAdres: account.emailAdres ?? "",
      url: account.url ?? "",
      gewensteActie: account.gewensteActie ?? "",
      overdrachtAan: account.overdrachtAan ?? "",
      notities: "",
    } : emptyAccountForm);
    setDialogType("account");
  }, []);

  const openWachtwoordDialog = useCallback((w?: WachtwoordEntry) => {
    setError(null);
    setEditId(w?.id ?? null);
    setWachtwoordForm(w ? {
      naam: w.naam,
      gebruikersnaam: w.gebruikersnaam ?? "",
      wachtwoord: "",
      url: w.url ?? "",
      notities: w.notities ?? "",
    } : emptyWachtwoordForm);
    setDialogType("wachtwoord");
  }, []);

  const openCryptoDialog = useCallback((c?: CryptoWallet) => {
    setError(null);
    setEditId(c?.id ?? null);
    setCryptoForm(c ? {
      walletNaam: c.walletNaam,
      cryptoType: c.cryptoType,
      walletAdres: c.walletAdres ?? "",
      exchange: c.exchange ?? "",
      seedPhrase: "",
      notities: c.notities ?? "",
    } : emptyCryptoForm);
    setDialogType("crypto");
  }, []);

  const closeDialog = useCallback(() => setDialogType(null), []);

  // Save handlers
  const saveAccount = useCallback(async () => {
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
        toast.success(tf("opgeslagen"));
      } else {
        await api.post("/api/digitaal-bezit/accounts", payload);
        toast.success(tf("aangemaakt"));
      }
      setDialogType(null);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("opslaanMislukt"));
    } finally {
      setSaving(false);
    }
  }, [accountForm, editId, loadData, t, tf]);

  const saveWachtwoord = useCallback(async () => {
    setError(null);
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/api/digitaal-bezit/wachtwoorden/${editId}`, {
          naam: wachtwoordForm.naam,
          gebruikersnaam: wachtwoordForm.gebruikersnaam || null,
          nieuwWachtwoord: wachtwoordForm.wachtwoord || null,
          url: wachtwoordForm.url || null,
          notities: wachtwoordForm.notities || null,
        });
      } else {
        await api.post("/api/digitaal-bezit/wachtwoorden", {
          naam: wachtwoordForm.naam,
          gebruikersnaam: wachtwoordForm.gebruikersnaam || null,
          wachtwoord: wachtwoordForm.wachtwoord,
          url: wachtwoordForm.url || null,
          notities: wachtwoordForm.notities || null,
        });
      }
      toast.success(editId ? tf("opgeslagen") : tf("aangemaakt"));
      setDialogType(null);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("opslaanMislukt"));
    } finally {
      setSaving(false);
    }
  }, [wachtwoordForm, editId, loadData, t, tf]);

  const saveCrypto = useCallback(async () => {
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
      toast.success(editId ? tf("opgeslagen") : tf("aangemaakt"));
      setDialogType(null);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("opslaanMislukt"));
    } finally {
      setSaving(false);
    }
  }, [cryptoForm, editId, loadData, t, tf]);

  const deleteItem = useCallback(async (type: string, id: string) => {
    try {
      await api.delete(`/api/digitaal-bezit/${type}/${id}`);
      toast.success(tf("verwijderd"));
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("verwijderenMislukt"));
    }
  }, [loadData, t, tf]);

  const handleOntsluitel = useCallback(async (id: string) => {
    if (ontsleuteld[id]) {
      setOntsleuteld((prev) => { const next = { ...prev }; delete next[id]; return next; });
      return;
    }
    try {
      const result = await api.get<{ id: string; wachtwoord: string }>(
        `/api/digitaal-bezit/wachtwoorden/${id}/ontsluitel`
      );
      setOntsleuteld((prev) => ({ ...prev, [id]: result.wachtwoord }));
      setTimeout(() => {
        setOntsleuteld((prev) => { const next = { ...prev }; delete next[id]; return next; });
      }, 10_000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("ontsluitenMislukt"));
    }
  }, [ontsleuteld, t]);

  const openImportDialog = useCallback(() => {
    setImportOpen(true);
    setImportResult(null);
  }, []);

  const handleImport = useCallback(async () => {
    const file = importFileRef.current?.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("bestand", file);
      const result = await api.upload<ImportResult>(
        "/api/digitaal-bezit/wachtwoorden/importeren",
        formData
      );
      setImportResult(result);
      if (result.geimporteerd > 0) loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("importerenMislukt"));
    } finally {
      setImporting(false);
    }
  }, [loadData, t]);

  return {
    // Data
    accounts,
    wachtwoorden,
    wallets,
    loading,
    error,
    // Dialog state
    dialogType,
    editId,
    accountForm,
    setAccountForm,
    wachtwoordForm,
    setWachtwoordForm,
    cryptoForm,
    setCryptoForm,
    saving,
    closeDialog,
    // Dialog openers
    openAccountDialog,
    openWachtwoordDialog,
    openCryptoDialog,
    // Save handlers
    saveAccount,
    saveWachtwoord,
    saveCrypto,
    deleteItem,
    // Password reveal
    ontsleuteld,
    handleOntsluitel,
    // Import
    importOpen,
    setImportOpen,
    importing,
    importResult,
    importFileRef,
    openImportDialog,
    handleImport,
  };
}
