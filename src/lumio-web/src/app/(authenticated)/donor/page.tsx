"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api-client";
import { Heart } from "lucide-react";
import Link from "next/link";
import { VoorbeeldDialog } from "@/components/VoorbeeldDialog";

interface DonorRegistratie {
  id: string;
  keuze: string;
  isGeregistreerdBijDonorregister: boolean;
  donorregisterReferentie?: string;
  toelichting?: string;
}

interface OrgaanKeuze {
  id: string;
  orgaan: string;
  welDoneren: boolean;
  toelichting?: string;
}

export default function DonorPage() {
  const [data, setData] = useState<DonorRegistratie | null>(null);
  const [orgaanKeuzes, setOrgaanKeuzes] = useState<OrgaanKeuze[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<DonorRegistratie>("/api/donor").catch(() => null),
      api.get<OrgaanKeuze[]>("/api/donor/orgaankeuzes").catch(() => []),
    ])
      .then(([d, o]) => {
        setData(d);
        setOrgaanKeuzes(o ?? []);
      })
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
          <h1 className="text-3xl font-bold">Donorregistratie</h1>
          <p className="text-muted-foreground mt-1">
            Uw keuze conform de Donorwet
          </p>
          <VoorbeeldDialog domein="donor" />
        </div>
        <Link href="/donor/formulier">
          <Button>
            <Heart className="h-4 w-4 mr-2" />
            {data ? "Bewerken" : "Registratie starten"}
          </Button>
        </Link>
      </div>

      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">
          <strong>Tip:</strong> Registreer uw keuze ook officieel bij het
          Donorregister via donorregister.nl. De informatie hier is voor uw
          nabestaanden.
        </p>
      </div>

      {!data ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nog geen donorkeuze vastgelegd.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Keuze</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Keuze:</span>{" "}
                <strong>{data.keuze}</strong>
              </p>
              <p>
                <span className="text-muted-foreground">
                  Geregistreerd bij Donorregister:
                </span>{" "}
                {data.isGeregistreerdBijDonorregister ? "Ja" : "Nee"}
              </p>
              {data.donorregisterReferentie && (
                <p>
                  <span className="text-muted-foreground">Referentie:</span>{" "}
                  {data.donorregisterReferentie}
                </p>
              )}
              {data.toelichting && (
                <p>
                  <span className="text-muted-foreground">Toelichting:</span>{" "}
                  {data.toelichting}
                </p>
              )}
            </CardContent>
          </Card>
          {orgaanKeuzes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Orgaankeuzes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {orgaanKeuzes.map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between rounded-md border p-2"
                    >
                      <span className="text-sm">{o.orgaan}</span>
                      <Badge variant={o.welDoneren ? "secondary" : "destructive"}>
                        {o.welDoneren ? "Ja" : "Nee"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
