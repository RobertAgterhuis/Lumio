"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Copy, Heart, Mail } from "lucide-react";

export function ReferralCard() {
  const t = useTranslations("instellingen.aanbevelen");
  const [copied, setCopied] = useState(false);

  const referralText = t("tekst");
  const mailtoHref = `mailto:?subject=${encodeURIComponent(t("emailOnderwerp"))}&body=${encodeURIComponent(t("emailBodyPre") + "\n\n" + referralText + "\n\n" + t("emailBodyPost"))}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Card className="overflow-hidden">
      <div className="bg-primary-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
        <Heart className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-primary leading-tight">{t("titel")}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{t("beschrijving")}</p>
        </div>
      </div>
      <CardContent className="pt-4 space-y-4">
        <div className="rounded-md bg-muted/60 border p-3 text-sm text-muted-foreground italic leading-relaxed">
          {referralText}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
            {copied ? (
              <span className="flex items-center gap-2 animate-[fadeSlideIn_150ms_ease-out_both]">
                <Check className="h-4 w-4 text-success" aria-hidden="true" />
                {t("gekopieerd")}
              </span>
            ) : (
              <>
                <Copy className="h-4 w-4" aria-hidden="true" />
                {t("kopieren")}
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" asChild className="gap-2">
            <a href={mailtoHref}>
              <Mail className="h-4 w-4" aria-hidden="true" />
              {t("viaEmail")}
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
