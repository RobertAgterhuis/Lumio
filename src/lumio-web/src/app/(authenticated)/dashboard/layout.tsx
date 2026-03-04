import type { ReactNode } from "react";
import { DomainMessagesProvider } from "@/components/providers/DomainMessagesProvider";
import type { AbstractIntlMessages } from "next-intl";
// nabestaanden lives in erfgenamen.json (used by NabestaandenDashboard)
import nlErfgenamen from "@messages/nl/erfgenamen.json";
import enErfgenamen from "@messages/en/erfgenamen.json";
// interview lives in misc.json (used by InterviewWizard)
import nlMisc from "@messages/nl/misc.json";
import enMisc from "@messages/en/misc.json";

const MESSAGES: Record<string, AbstractIntlMessages> = {
  nl: { ...nlErfgenamen, ...nlMisc } as AbstractIntlMessages,
  en: { ...enErfgenamen, ...enMisc } as AbstractIntlMessages,
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DomainMessagesProvider messages={MESSAGES}>
      {children}
    </DomainMessagesProvider>
  );
}
