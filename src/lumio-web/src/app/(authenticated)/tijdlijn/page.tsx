"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertTriangle,
  Clock,
  Calendar,
  CalendarDays,
  ListChecks,
  Stethoscope,
  Church,
  Phone,
  ScrollText,
  Wallet,
  Globe,
  Building2,
  Landmark,
  ShieldCheck,
  FileText,
  Scale,
  HeartHandshake,
  UserX,
} from "lucide-react";

interface TijdlijnStap {
  titel: string;
  beschrijving: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface TijdlijnFase {
  fase: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
  stappen: TijdlijnStap[];
}

const tijdlijn: TijdlijnFase[] = [
  {
    fase: "24uur",
    label: "Eerste 24 uur",
    icon: AlertTriangle,
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-800",
    dotColor: "bg-red-500",
    stappen: [
      {
        titel: "Huisarts of behandelend arts bellen",
        beschrijving:
          "De arts stelt de dood vast en geeft een verklaring van overlijden af. Zonder deze verklaring kan de uitvaart niet geregeld worden.",
        icon: Stethoscope,
      },
      {
        titel: "Uitvaartondernemer inschakelen",
        beschrijving:
          "Neem contact op met de uitvaartondernemer of -verzekering. Zij begeleiden de verdere procedure en regelen het vervoer.",
        icon: Church,
      },
      {
        titel: "Naasten en noodcontacten informeren",
        beschrijving:
          "Breng directe familieleden, noodcontacten en eventueel de werkgever op de hoogte.",
        icon: Phone,
      },
      {
        titel: "Donorregistratie controleren",
        beschrijving:
          "Check zo snel mogelijk of er een donorregistratie is. Bij orgaandonatie is snelheid essentieel.",
        icon: HeartHandshake,
      },
      {
        titel: "Wilsverklaring euthanasie raadplegen",
        beschrijving:
          "Indien van toepassing: controleer of er een wilsverklaring of behandelverbod is vastgelegd.",
        icon: ShieldCheck,
      },
    ],
  },
  {
    fase: "week1",
    label: "Eerste week",
    icon: Clock,
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
    dotColor: "bg-amber-500",
    stappen: [
      {
        titel: "Notaris informeren",
        beschrijving:
          "De notaris opent het testament en informeert over de erfgenamen, de executeur en eventuele legaten.",
        icon: ScrollText,
      },
      {
        titel: "Werkgever(s) informeren",
        beschrijving:
          "Meld het overlijden bij de werkgever. Bespreek eventueel recht op nabestaandenpensioen en uitkering van het vakantiegeld.",
        icon: Building2,
      },
      {
        titel: "Overlijdensaangifte bij gemeente",
        beschrijving:
          "Doe binnen 6 werkdagen aangifte van overlijden bij de burgerlijke stand van de gemeente waar het overlijden plaatsvond.",
        icon: Landmark,
      },
      {
        titel: "Belangrijke documenten verzamelen",
        beschrijving:
          "Verzamel het identiteitsbewijs, trouwboekje, polissen, testament en bankafschriften.",
        icon: FileText,
      },
    ],
  },
  {
    fase: "maand1",
    label: "Eerste maand",
    icon: Calendar,
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    dotColor: "bg-blue-500",
    stappen: [
      {
        titel: "Verzekeringen afhandelen",
        beschrijving:
          "Meld het overlijden bij alle verzekeringsmaatschappijen: zorgverzekering, levensverzekering, inboedel, aansprakelijkheid, overlijdensrisico.",
        icon: ShieldCheck,
      },
      {
        titel: "Bankzaken regelen",
        beschrijving:
          "Informeer de bank. Rekeningen worden op naam van de erven gezet. Regel betaalopdrachten en eventueel een derdenrekening voor de boedel.",
        icon: Landmark,
      },
      {
        titel: "Abonnementen en contracten opzeggen",
        beschrijving:
          "Zeg telefoon-, internet-, tv-abonnementen, huur of leasecontracten, lidmaatschappen en streaming-diensten op.",
        icon: FileText,
      },
      {
        titel: "Uitkeringen en toeslagen stopzetten",
        beschrijving:
          "Meld het overlijden bij de SVB (AOW), UWV, gemeente (bijstand) en Belastingdienst (toeslagen).",
        icon: Building2,
      },
      {
        titel: "Digitaal bezit afhandelen",
        beschrijving:
          "Online accounts sluiten of overnemen: e-mail, social media, cloud-opslag, webshops. Controleer of er cryptocurrency is.",
        icon: Globe,
      },
    ],
  },
  {
    fase: "3maanden",
    label: "Eerste 3 maanden",
    icon: CalendarDays,
    color: "text-violet-700 dark:text-violet-400",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
    borderColor: "border-violet-200 dark:border-violet-800",
    dotColor: "bg-violet-500",
    stappen: [
      {
        titel: "Aangifte erfbelasting",
        beschrijving:
          "Doe binnen 8 maanden aangifte erfbelasting bij de Belastingdienst. Begin tijdig met het inventariseren van de boedel.",
        icon: Scale,
      },
      {
        titel: "Aanvaarding of verwerping erfenis",
        beschrijving:
          "Erfgenamen moeten kiezen: zuiver aanvaarden, beneficiair aanvaarden of verwerpen. Beneficiair aanvaarden beschermt tegen schulden.",
        icon: ScrollText,
      },
      {
        titel: "Boedelverdeling",
        beschrijving:
          "Inventariseer alle bezittingen en schulden. Verdeel de boedel volgens het testament of wettelijk erfrecht. De executeur coördineert dit.",
        icon: Wallet,
      },
      {
        titel: "Inkomstenbelasting overledene",
        beschrijving:
          "Doe aangifte inkomstenbelasting voor het jaar van overlijden (F-biljet). Deadline is meestal vóór 1 mei van het jaar erna.",
        icon: Building2,
      },
      {
        titel: "Social media en online profielen",
        beschrijving:
          "Verwijder of memorial-modus instellen voor Facebook, Instagram, LinkedIn en andere social media-accounts.",
        icon: UserX,
      },
    ],
  },
];

export default function TijdlijnPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <ListChecks className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">
            Tijdlijn na overlijden
          </h1>
        </div>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Een overzicht van wat er wanneer geregeld moet worden na een
          overlijden. Gebruik deze checklist als leidraad voor uw nabestaanden.
          De exacte volgorde kan per situatie verschillen.
        </p>
      </div>

      {tijdlijn.map((fase) => {
        const FaseIcon = fase.icon;

        return (
          <div key={fase.fase} className="space-y-4">
            {/* Faseheader */}
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${fase.bgColor}`}
              >
                <FaseIcon className={`h-5 w-5 ${fase.color}`} />
              </div>
              <h2 className={`text-xl font-semibold ${fase.color}`}>
                {fase.label}
              </h2>
            </div>

            {/* Stappen met verticale lijn */}
            <div className="relative ml-5 border-l-2 border-border pl-8 space-y-4">
              {fase.stappen.map((stap, idx) => {
                const StapIcon = stap.icon;
                return (
                  <div key={idx} className="relative">
                    {/* Dot op de lijn */}
                    <div
                      className={`absolute -left-[calc(2rem+5px)] top-4 h-3 w-3 rounded-full ${fase.dotColor} ring-4 ring-background`}
                    />
                    <Card
                      className={`border ${fase.borderColor} transition-colors hover:shadow-sm`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${fase.bgColor}`}
                          >
                            <StapIcon
                              className={`h-4 w-4 ${fase.color}`}
                            />
                          </div>
                          <CardTitle className="text-base">
                            {stap.titel}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm leading-relaxed">
                          {stap.beschrijving}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Disclaimer */}
      <Card className="border-muted bg-muted/30">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground">
            <strong>Let op:</strong> Dit overzicht is informatief en geen
            juridisch advies. De termijnen en verplichtingen kunnen per
            situatie verschillen. Raadpleeg altijd een notaris of juridisch
            adviseur voor uw specifieke situatie.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
