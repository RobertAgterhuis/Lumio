import type { ReactNode } from "react";
import { DomainMessagesProvider } from "@/components/providers/DomainMessagesProvider";
import type { AbstractIntlMessages } from "next-intl";
import nlMessages from "@messages/nl/erfgenamen.json";
import enMessages from "@messages/en/erfgenamen.json";

const MESSAGES: Record<string, AbstractIntlMessages> = {
  nl: nlMessages as AbstractIntlMessages,
  en: enMessages as AbstractIntlMessages,
};

export default function ErfgenamenLayout({ children }: { children: ReactNode }) {
  return (
    <DomainMessagesProvider messages={MESSAGES}>
      {children}
    </DomainMessagesProvider>
  );
}
