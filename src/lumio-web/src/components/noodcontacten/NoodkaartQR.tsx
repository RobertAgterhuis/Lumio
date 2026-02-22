"use client";

import { useEffect, useRef, useState } from "react";
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

  const qrText = [
    "LUMIO NOODKAART",
    "================",
    "",
    "Bij overlijden, neem contact op met:",
    "",
    ...contacten.map((c) => {
      const lines = [`• ${c.naam}`];
      if (c.relatie) lines.push(`  Relatie: ${c.relatie}`);
      if (c.rol) lines.push(`  Rol: ${c.rol}`);
      if (c.telefoon) lines.push(`  Tel: ${c.telefoon}`);
      if (c.email) lines.push(`  E-mail: ${c.email}`);
      return lines.join("\n");
    }),
    "",
    "Gegevens opgeslagen in Lumio.",
    "Gebruik de Shamir-sleutels om de",
    "volledige gegevens te ontgrendelen.",
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
        <QrCode className="h-4 w-4 mr-1" /> QR-code
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle>Noodkaart QR-code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <p className="text-sm text-muted-foreground text-center">
            Print of bewaar deze QR-code bij uw noodkaart. Nabestaanden
            kunnen de code scannen voor directe toegang tot uw noodcontacten.
          </p>
          <div className="border rounded-lg p-4 bg-white">
            <canvas ref={canvasRef} />
          </div>
          <p className="text-xs text-muted-foreground text-center max-w-sm">
            De QR-code bevat de namen, telefoonnummers en rollen van uw noodcontacten.
            Geen wachtwoorden of gevoelige gegevens worden opgenomen.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Sluiten</Button>
          <Button onClick={downloadQR}>
            <Download className="h-4 w-4 mr-1" /> Downloaden
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
