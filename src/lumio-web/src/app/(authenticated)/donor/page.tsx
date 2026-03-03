"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDomainQuery } from "@/hooks";
import { useTranslations } from "next-intl";
import { HeartHandshake, Activity } from "lucide-react";
import { LumioIcon } from "@/components/ui/lumio-icon";
import Link from "next/link";
import { VoorbeeldDialog } from "@/components/VoorbeeldDialog";
import { SectieNotitie } from "@/components/notities/SectieNotitie";
import { DomainStatusBanner } from "@/components/domain/DomainStatusBanner";
import { PageBanner } from "@/components/layout/PageBanner";
import { HelpButton } from "@/components/help/HelpButton";

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
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <LumioIcon name="donor" size="lg" className="text-primary" />
            {t("titel")}
            <HelpButton />
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("beschrijving")}
          </p>
          <VoorbeeldDialog domein="donor" />
          <SectieNotitie sectie="donor" />
        </div>
        <Link href="/donor/formulier">
          <Button>
            <LumioIcon name="donor" size="sm" className="mr-2" />
            {data ? t("bewerken") : t("registratieStarten")}
          </Button>
        </Link>
      </div>

      <DomainStatusBanner domein="donor" />

      <PageBanner id="donor-disclaimer" variant="secure">
        {t.rich("disclaimer", {
          strong: (chunks) => <strong>{chunks}</strong>,
          link: (chunks) => (
            <a
              href="https://donorregister.nl"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium"
            >
              {chunks}
            </a>
          ),
        })}
      </PageBanner>

      <PageBanner id="donor-tip" variant="info">
        {t.rich("tip", { strong: (chunks) => <strong>{chunks}</strong> })}
      </PageBanner>

      {!data ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LumioIcon name="donor" size="xl" className="text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {t("geenKeuze")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="overflow-hidden">
            <div className="bg-success-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
              <HeartHandshake className="h-5 w-5 text-success shrink-0" />
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-success leading-tight">{t("keuzeCard.titel")}</h2>
              </div>
            </div>
            <CardContent className="pt-5 space-y-2 text-sm">
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
            <Card className="overflow-hidden">
              <div className="bg-success-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
                <Activity className="h-5 w-5 text-success shrink-0" />
                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-success leading-tight">{t("orgaanCard.titel")}</h2>
                </div>
              </div>
              <CardContent className="pt-5">
                <div className="space-y-2">
                  {orgaanKeuzes.map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between rounded-md border p-2"
                    >
                      <span className="text-sm">{o.orgaan}</span>
                      <Badge variant={o.welDoneren ? "secondary" : "outline"} className={!o.welDoneren ? "text-muted-foreground" : undefined}>
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
