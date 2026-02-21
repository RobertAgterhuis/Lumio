"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api-client";
import {
  ScrollText,
  Heart,
  Stethoscope,
  Globe,
  Wallet,
  Church,
  FileText,
  Users,
  ArrowRight,
  User,
  AlertTriangle,
  Phone,
  CheckCircle2,
  Circle,
} from "lucide-react";

interface DomeinStatus {
  domein: string;
  label: string;
  ingevuld: boolean;
}

interface Compleetheid {
  percentage: number;
  aantalIngevuld: number;
  totaal: number;
  domeinen: DomeinStatus[];
}

const domainCards = [
  {
    href: "/eigenaar",
    domein: "eigenaar",
    icon: User,
    titel: "Mijn Profiel",
    beschrijving: "Persoonlijke gegevens en contactinformatie",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
  },
  {
    href: "/testament",
    domein: "testament",
    icon: ScrollText,
    titel: "Testament",
    beschrijving: "Testamentaire informatie, begunstigden en executeurs",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    href: "/euthanasie",
    domein: "euthanasie",
    icon: Stethoscope,
    titel: "Wilsverklaring Euthanasie",
    beschrijving: "Uw wensen rondom euthanasie en medische behandeling",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    href: "/donor",
    domein: "donor",
    icon: Heart,
    titel: "Donorregistratie",
    beschrijving: "Orgaandonatie keuzes en registratie",
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    href: "/digitaal-bezit",
    domein: "digitaal-bezit",
    icon: Globe,
    titel: "Digitaal Bezit",
    beschrijving: "Online accounts, wachtwoorden en crypto wallets",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    href: "/boedel",
    domein: "boedel",
    icon: Wallet,
    titel: "Boedel",
    beschrijving: "Bezittingen, bankrekeningen, verzekeringen en schulden",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    href: "/uitvaart",
    domein: "uitvaart",
    icon: Church,
    titel: "Uitvaartwensen",
    beschrijving: "Begrafenis of crematie, ceremonie en rouwkaart",
    color: "text-stone-600",
    bgColor: "bg-stone-50",
  },
  {
    href: "/documenten",
    domein: "documenten",
    icon: FileText,
    titel: "Documenten",
    beschrijving: "Belangrijke documenten veilig opslaan",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
  },
  {
    href: "/erfgenamen",
    domein: "erfgenamen",
    icon: Users,
    titel: "Erfgenamen",
    beschrijving: "Erfgenamen beheren en sleuteldelen verdelen",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  {
    href: "/noodcontacten",
    domein: "noodcontacten",
    icon: Phone,
    titel: "Noodcontacten",
    beschrijving: "Vertrouwenspersonen en hulpverleners voor noodsituaties",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
  },
];

export default function DashboardPage() {
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [compleetheid, setCompleetheid] = useState<Compleetheid | null>(null);

  useEffect(() => {
    api
      .get("/api/eigenaar")
      .then(() => setHasProfile(true))
      .catch(() => setHasProfile(false));

    api
      .get<Compleetheid>("/api/status/compleetheid")
      .then(setCompleetheid)
      .catch(() => {});
  }, []);

  const getDomeinStatus = (domein: string): boolean | null => {
    if (!compleetheid) return null;
    const d = compleetheid.domeinen.find((x) => x.domein === domein);
    return d?.ingevuld ?? null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Beheer uw digitale nalatenschap. Klik op een onderdeel om te beginnen.
        </p>
      </div>

      {/* Compleetheid-indicator */}
      {compleetheid && (
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">
              Voortgang nalatenschap
            </h2>
            <span className="text-sm font-bold text-primary">
              {compleetheid.percentage}%
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${compleetheid.percentage}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {compleetheid.aantalIngevuld} van {compleetheid.totaal} onderdelen
            ingevuld
          </p>
        </div>
      )}

      {hasProfile === false && (
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-900">
                Vul eerst uw profiel in om te beginnen
              </p>
              <p className="text-sm text-amber-800 mt-1">
                Voordat u gegevens kunt opslaan in Lumio, moet u eerst uw
                persoonsgegevens invullen. Dit is eenmalig.
              </p>
              <Link href="/eigenaar">
                <Button size="sm" className="mt-3">
                  <User className="h-4 w-4 mr-2" /> Profiel aanmaken
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Let op:</strong> Lumio is een hulpmiddel voor het vastleggen van uw wensen.
          Een notarieel testament blijft vereist voor juridische geldigheid conform het
          Burgerlijk Wetboek (BW Boek 4).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {domainCards.map((card) => {
          const Icon = card.icon;
          const status = getDomeinStatus(card.domein);
          return (
            <Link key={card.href} href={card.href}>
              <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bgColor}`}>
                      <Icon className={`h-5 w-5 ${card.color}`} />
                    </div>
                    {status === true ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Ingevuld
                      </Badge>
                    ) : status === false ? (
                      <Badge variant="secondary" className="gap-1">
                        <Circle className="h-3 w-3" />
                        Beginnen
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Beginnen</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg mt-3">{card.titel}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{card.beschrijving}</CardDescription>
                  <div className="mt-3 flex items-center text-sm text-primary">
                    Openen <ArrowRight className="ml-1 h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
