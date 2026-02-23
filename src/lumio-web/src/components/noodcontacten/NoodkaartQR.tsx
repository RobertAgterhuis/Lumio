"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { QrCode, Download } from "lucide-react";

interface NoodkaartQRProps {
  contacten: {
    naam: string;
    relatie?: string;
    telefoon?: string;
    email?: string;
    rol?: string;
  }[];
}

export function NoodkaartQR({ contacten }: NoodkaartQRProps) {
  const [open, setOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const t = useTranslations("noodkaartQR");

  const qrText = [
    t("qrTitel"),
    "================",
    "",
    t("qrInstructie"),
    "",
    ...contacten.map((c) => {
      const lines = [`• ${c.naam}`];
      if (c.relatie) lines.push(`  ${t("qrRelatie", { relatie: c.relatie })}`);
      if (c.rol) lines.push(`  ${t("qrRol", { rol: c.rol })}`);
      if (c.telefoon) lines.push(`  ${t("qrTel", { telefoon: c.telefoon })}`);
      if (c.email) lines.push(`  ${t("qrEmail", { email: c.email })}`);
      return lines.join("\n");
    }),
    "",
    t("qrOpgeslagen"),
    t("qrShamir"),
  ].join("\n");

  useEffect(() => {
    if (open && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, qrText, {
        width: 300,
        margin: 2,
        color: { dark: "#1e3a5f", light: "#ffffff" },
      });
    }
  }, [open, qrText]);

  const downloadQR = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "lumio-noodkaart-qr.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  if (contacten.length === 0) return null;

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <QrCode className="h-4 w-4 mr-1" /> {t("knop")}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle>{t("titel")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <p className="text-sm text-muted-foreground text-center">
            {t("beschrijving")}
          </p>
          <div className="border rounded-lg p-4 bg-white">
            <canvas ref={canvasRef} />
          </div>
          <p className="text-xs text-muted-foreground text-center max-w-sm">
            {t("privacyInfo")}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>{t("sluiten")}</Button>
          <Button onClick={downloadQR}>
            <Download className="h-4 w-4 mr-1" /> {t("downloaden")}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
