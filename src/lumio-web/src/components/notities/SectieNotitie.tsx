"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, Save, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface SectieNotitieProps {
  sectie: string;
}

export function SectieNotitie({ sectie }: SectieNotitieProps) {
  const [inhoud, setInhoud] = useState("");
  const [origineel, setOrigineel] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const t = useTranslations("sectieNotitie");

  useEffect(() => {
    api
      .get<{ inhoud: string }>(`/api/notities/${sectie}`)
      .then((n) => {
        setInhoud(n.inhoud);
        setOrigineel(n.inhoud);
      })
      .catch(() => {
        setInhoud("");
        setOrigineel("");
      });
  }, [sectie]);

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/api/notities/${sectie}`, { inhoud });
      setOrigineel(inhoud);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    setInhoud(origineel);
    setEditing(false);
  };

  const hasContent = inhoud.trim().length > 0;
  const isDirty = inhoud !== origineel;

  if (!editing && !hasContent) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <StickyNote className="h-3.5 w-3.5" />
        {t("toevoegen")}
      </button>
    );
  }

  if (!editing) {
    return (
      <div
        className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm cursor-pointer hover:border-amber-300 transition-colors"
        onClick={() => setEditing(true)}
      >
        <div className="flex items-start gap-2">
          <StickyNote className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-amber-900 whitespace-pre-wrap">{inhoud}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-3 space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-amber-900">
        <StickyNote className="h-4 w-4 text-amber-600" />
        {t("titel")}
      </div>
      <Textarea
        value={inhoud}
        onChange={(e) => setInhoud(e.target.value)}
        placeholder={t("placeholder")}
        className="bg-white"
        rows={3}
        autoFocus
      />
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={cancel}>
          <X className="h-3.5 w-3.5 mr-1" /> {t("annuleren")}
        </Button>
        <Button size="sm" onClick={save} disabled={saving || !isDirty}>
          <Save className="h-3.5 w-3.5 mr-1" /> {saving ? t("opslaanBezig") : t("opslaan")}
        </Button>
      </div>
    </div>
  );
}
