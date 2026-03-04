import type { ReactNode } from "react";
import { DomainMessagesProvider } from "@/components/providers/DomainMessagesProvider";
import type { AbstractIntlMessages } from "next-intl";
import nlMessages from "@messages/nl/euthanasie.json";
import enMessages from "@messages/en/euthanasie.json";
// voorbeeldData lives in videoboodschappen.json
import nlVideo from "@messages/nl/videoboodschappen.json";
import enVideo from "@messages/en/videoboodschappen.json";

const MESSAGES: Record<string, AbstractIntlMessages> = {
  nl: { ...nlMessages, ...nlVideo } as AbstractIntlMessages,
  en: { ...enMessages, ...enVideo } as AbstractIntlMessages,
};

export default function EuthanasieLayout({ children }: { children: ReactNode }) {
  return (
    <DomainMessagesProvider messages={MESSAGES}>
      {children}
    </DomainMessagesProvider>
  );
}
