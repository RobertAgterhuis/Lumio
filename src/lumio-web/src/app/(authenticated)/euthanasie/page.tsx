"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api-client";
import { Stethoscope } from "lucide-react";
import Link from "next/link";

interface Wilsverklaring {
  id: string;
  wilEuthanasie: boolean;
  situatieBeschrijving?: string;
  huisarts?: string;
  huisartsPraktijk?: string;
  huisartsTelefoon?: string;
  huisartsEmail?: string;
  vertegenwoordigerNaam?: string;
  vertegenwoordigerRelatie?: string;
  vertegenwoordigerTelefoon?: string;
  vertegenwoordigerEmail?: string;
  vertegenwoordigerAdres?: string;
  vertegenwoordigerPostcode?: string;
  vertegenwoordigerWoonplaats?: string;
  aanvullendeWensen?: string;
  datumOndertekening?: string;
}

export default function EuthanasiePage() {
  const [data, setData] = useState<Wilsverklaring | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Wilsverklaring>("/api/euthanasie")
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Laden...</p>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Wilsverklaring Euthanasie</h1>
          <p className="text-muted-foreground mt-1">
            Uw wensen conform de WGBO
          </p>
        </div>
        <Link href="/euthanasie/wizard">
          <Button>
            <Stethoscope className="h-4 w-4 mr-2" />
            {data ? "Bewerken" : "Wizard starten"}
          </Button>
        </Link>
      </div>

      <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
        <p className="text-sm text-purple-800">
          <strong>Belangrijk:</strong> Een schriftelijke wilsverklaring
          euthanasie is geen garantie dat euthanasie wordt uitgevoerd. De arts
          moet altijd de zorgvuldigheidseisen van de Wet toetsing
          levensbeëindiging (Wtl) toetsen.
        </p>
      </div>

      {!data ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Stethoscope className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nog geen wilsverklaring vastgelegd.
            </p>
            <Link href="/euthanasie/wizard">
              <Button className="mt-4">Wizard starten</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Wilsverklaring</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Wil euthanasie:</span>{" "}
                {data.wilEuthanasie ? "Ja" : "Nee"}
              </p>
              {data.datumOndertekening && (
                <p>
                  <span className="text-muted-foreground">
                    Datum ondertekening:
                  </span>{" "}
                  {data.datumOndertekening}
                </p>
              )}
              {data.situatieBeschrijving && (
                <p>
                  <span className="text-muted-foreground">Situatie:</span>{" "}
                  {data.situatieBeschrijving}
                </p>
              )}
              {data.aanvullendeWensen && (
                <p>
                  <span className="text-muted-foreground">
                    Aanvullende wensen:
                  </span>{" "}
                  {data.aanvullendeWensen}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Huisarts & Vertegenwoordiger</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {data.huisarts && (
                <p>
                  <span className="text-muted-foreground">Huisarts:</span>{" "}
                  {data.huisarts}
                </p>
              )}
              {data.huisartsPraktijk && (
                <p>
                  <span className="text-muted-foreground">Praktijk:</span>{" "}
                  {data.huisartsPraktijk}
                </p>
              )}
              {data.huisartsTelefoon && (
                <p>
                  <span className="text-muted-foreground">Telefoon huisarts:</span>{" "}
                  {data.huisartsTelefoon}
                </p>
              )}
              {data.huisartsEmail && (
                <p>
                  <span className="text-muted-foreground">E-mail huisarts:</span>{" "}
                  {data.huisartsEmail}
                </p>
              )}
              {data.vertegenwoordigerNaam && (
                <p>
                  <span className="text-muted-foreground">
                    Vertegenwoordiger:
                  </span>{" "}
                  {data.vertegenwoordigerNaam} ({data.vertegenwoordigerRelatie})
                </p>
              )}
              {data.vertegenwoordigerTelefoon && (
                <p>
                  <span className="text-muted-foreground">Tel. vertegenwoordiger:</span>{" "}
                  {data.vertegenwoordigerTelefoon}
                </p>
              )}
              {data.vertegenwoordigerEmail && (
                <p>
                  <span className="text-muted-foreground">E-mail vertegenwoordiger:</span>{" "}
                  {data.vertegenwoordigerEmail}
                </p>
              )}
              {data.vertegenwoordigerAdres && (
                <p>
                  <span className="text-muted-foreground">Adres vertegenwoordiger:</span>{" "}
                  {data.vertegenwoordigerAdres}
                  {data.vertegenwoordigerPostcode ? `, ${data.vertegenwoordigerPostcode}` : ""}
                  {data.vertegenwoordigerWoonplaats ? ` ${data.vertegenwoordigerWoonplaats}` : ""}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
