"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LumioIcon } from "@/components/ui/lumio-icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VoorbeeldDialog } from "@/components/VoorbeeldDialog";
import { SectieNotitie } from "@/components/notities/SectieNotitie";
import { DomainStatusBanner } from "@/components/domain/DomainStatusBanner";
import {
  zoekAfsluitInstructie,
  zoekAfsluitInstructiesVoorCategorie,
  type AfsluitInstructie,
} from "@/lib/afsluit-instructies";
import {
  type DigitaalAccount,
  useDigitaalBezit,
  AccountsTab,
  WachtwoordenTab,
  CryptoTab,
  AccountDialog,
  WachtwoordDialog,
  CryptoDialog,
  ImportDialog,
} from "@/components/digitaal-bezit";

export default function DigitaalBezitPage() {
  const t = useTranslations("digitaalBezit");
  const tf = useTranslations("feedback");
  const [tab, setTab] = useState("accounts");
  const [categorieFilter, setCategorieFilter] = useState("");
  const [instructieOpen, setInstructieOpen] = useState<Record<string, boolean>>({});

  const {
    accounts,
    wachtwoorden,
    wallets,
    loading,
    error,
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
    openAccountDialog,
    openWachtwoordDialog,
    openCryptoDialog,
    saveAccount,
    saveWachtwoord,
    saveCrypto,
    deleteItem,
    ontsleuteld,
    handleOntsluitel,
    importOpen,
    setImportOpen,
    importing,
    importResult,
    importFileRef,
    openImportDialog,
    handleImport,
  } = useDigitaalBezit(tf, t);

  const getInstructie = (account: DigitaalAccount): AfsluitInstructie | undefined => {
    const direct = zoekAfsluitInstructie(account.platformNaam);
    if (direct) return direct;
    if (account.categorie) {
      const catResults = zoekAfsluitInstructiesVoorCategorie(account.categorie);
      return catResults.length > 0 ? catResults[0] : undefined;
    }
    return undefined;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{t("laden")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <LumioIcon name="digitaal-bezit" size="lg" className="text-primary" />
          {t("titel")}
        </h1>
        <p className="text-muted-foreground mt-1">{t("beschrijving")}</p>
        <VoorbeeldDialog domein="digitaal-bezit" />
        <SectieNotitie sectie="digitaal-bezit" />
      </div>

      <DomainStatusBanner domein="digitaal-bezit" />

      <div className="rounded-lg border border-success bg-success-100 p-4">
        <p className="text-sm text-success">
          <strong>{t("beveiligingsTipLabel")}</strong> {t("beveiligingsTip")}
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="accounts">
            <LumioIcon name="digitaal-bezit" size="sm" className="mr-1" /> {t("tabs.accounts", { aantal: accounts.length })}
          </TabsTrigger>
          <TabsTrigger value="wachtwoorden">
            <LumioIcon name="digitaal-bezit" size="sm" className="mr-1" /> {t("tabs.wachtwoorden", { aantal: wachtwoorden.length })}
          </TabsTrigger>
          <TabsTrigger value="crypto">
            <LumioIcon name="digitaal-bezit" size="sm" className="mr-1" /> {t("tabs.crypto", { aantal: wallets.length })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <AccountsTab
            accounts={accounts}
            categorieFilter={categorieFilter}
            onCategorieFilterChange={setCategorieFilter}
            getInstructie={getInstructie}
            instructieOpen={instructieOpen}
            onToggleInstructie={(id) => setInstructieOpen((prev) => ({ ...prev, [id]: !prev[id] }))}
            onAdd={() => openAccountDialog()}
            onEdit={openAccountDialog}
            onDelete={(id) => deleteItem("accounts", id)}
          />
        </TabsContent>

        <TabsContent value="wachtwoorden">
          <WachtwoordenTab
            wachtwoorden={wachtwoorden}
            ontsleuteld={ontsleuteld}
            onToggleOntsluitel={handleOntsluitel}
            onAdd={() => openWachtwoordDialog()}
            onEdit={openWachtwoordDialog}
            onDelete={(id) => deleteItem("wachtwoorden", id)}
            onImport={openImportDialog}
          />
        </TabsContent>

        <TabsContent value="crypto">
          <CryptoTab
            wallets={wallets}
            onAdd={() => openCryptoDialog()}
            onEdit={openCryptoDialog}
            onDelete={(id) => deleteItem("crypto", id)}
          />
        </TabsContent>
      </Tabs>

      {error && (
        <div className="rounded-lg border border-danger bg-danger-100 dark:bg-danger/20 p-3">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      <AccountDialog
        open={dialogType === "account"}
        onOpenChange={closeDialog}
        editMode={!!editId}
        form={accountForm}
        onFormChange={setAccountForm}
        onSave={saveAccount}
        saving={saving}
      />
      <WachtwoordDialog
        open={dialogType === "wachtwoord"}
        onOpenChange={closeDialog}
        editMode={!!editId}
        form={wachtwoordForm}
        onFormChange={setWachtwoordForm}
        onSave={saveWachtwoord}
        saving={saving}
      />
      <CryptoDialog
        open={dialogType === "crypto"}
        onOpenChange={closeDialog}
        editMode={!!editId}
        form={cryptoForm}
        onFormChange={setCryptoForm}
        onSave={saveCrypto}
        saving={saving}
      />
      <ImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        importing={importing}
        importResult={importResult}
        onImport={handleImport}
        fileInputRef={importFileRef}
      />
    </div>
  );
}
