import type { ReactNode } from "react";
import { DomainMessagesProvider } from "@/components/providers/DomainMessagesProvider";
import type { AbstractIntlMessages } from "next-intl";
import nlMessages from "@messages/nl/instellingen.json";
import enMessages from "@messages/en/instellingen.json";
// dataHandtekening lives in misc.json
import nlMisc from "@messages/nl/misc.json";
import enMisc from "@messages/en/misc.json";

const MESSAGES: Record<string, AbstractIntlMessages> = {
  nl: { ...nlMessages, ...nlMisc } as AbstractIntlMessages,
  en: { ...enMessages, ...enMisc } as AbstractIntlMessages,
};

export default function InstellingenLayout({ children }: { children: ReactNode }) {
  return (
    <DomainMessagesProvider messages={MESSAGES}>
      {children}
    </DomainMessagesProvider>
  );
}
