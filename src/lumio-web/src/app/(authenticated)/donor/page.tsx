"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDomainQuery } from "@/hooks";
import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import Link from "next/link";
import { VoorbeeldDialog } from "@/components/VoorbeeldDialog";
import { SectieNotitie } from "@/components/notities/SectieNotitie";
import { DomainStatusBanner } from "@/components/domain/DomainStatusBanner";

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
  const t = useTranslations("donor");

  const { data, isLoading: donorLoading } = useDomainQuery<DonorRegistratie | null>("donor");
  const { data: orgaanKeuzes = [], isLoading: orgaanLoading } = useDomainQuery<OrgaanKeuze[]>("donor/orgaankeuzes");

  const loading = donorLoading || orgaanLoading;

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{t("laden")}</p>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("titel")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("beschrijving")}
          </p>
          <VoorbeeldDialog domein="donor" />
          <SectieNotitie sectie="donor" />
        </div>
        <Link href="/donor/formulier">
          <Button>
            <Heart className="h-4 w-4 mr-2" />
            {data ? t("bewerken") : t("registratieStarten")}
          </Button>
        </Link>
      </div>

      <DomainStatusBanner domein="donor" />

      <div className="rounded-lg border border-danger bg-danger-100 p-4">
        <p className="text-sm text-danger">
          {t.rich("tip", { strong: (chunks) => <strong>{chunks}</strong> })}
        </p>
      </div>

      {!data ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {t("geenKeuze")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("keuzeCard.titel")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">{t("keuzeCard.keuze")}</span>{" "}
                <strong>{data.keuze}</strong>
              </p>
              <p>
                <span className="text-muted-foreground">
                  {t("keuzeCard.geregistreerd")}
                </span>{" "}
                {data.isGeregistreerdBijDonorregister ? t("ja") : t("nee")}
              </p>
              {data.donorregisterReferentie && (
                <p>
                  <span className="text-muted-foreground">{t("keuzeCard.referentie")}</span>{" "}
                  {data.donorregisterReferentie.startsWith("http") ? (
                    <a
                      href={data.donorregisterReferentie}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline hover:text-primary/80"
                    >
                      {data.donorregisterReferentie}
                    </a>
                  ) : (
                    data.donorregisterReferentie
                  )}
                </p>
              )}
              {data.toelichting && (
                <p>
                  <span className="text-muted-foreground">{t("keuzeCard.toelichting")}</span>{" "}
                  {data.toelichting}
                </p>
              )}
            </CardContent>
          </Card>
          {orgaanKeuzes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t("orgaanCard.titel")}</CardTitle>
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
                        {o.welDoneren ? t("ja") : t("nee")}
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
