import type { ReactNode } from "react";
import { DomainMessagesProvider } from "@/components/providers/DomainMessagesProvider";
import type { AbstractIntlMessages } from "next-intl";
import nlMessages from "@messages/nl/noodcontacten.json";
import enMessages from "@messages/en/noodcontacten.json";
// noodkaartQR lives in uitvaart.json
import nlUitvaart from "@messages/nl/uitvaart.json";
import enUitvaart from "@messages/en/uitvaart.json";
// voorbeeldData lives in videoboodschappen.json
import nlVideo from "@messages/nl/videoboodschappen.json";
import enVideo from "@messages/en/videoboodschappen.json";

const MESSAGES: Record<string, AbstractIntlMessages> = {
  nl: { ...nlMessages, ...nlUitvaart, ...nlVideo } as AbstractIntlMessages,
  en: { ...enMessages, ...enUitvaart, ...enVideo } as AbstractIntlMessages,
};

export default function NoodcontactenLayout({ children }: { children: ReactNode }) {
  return (
    <DomainMessagesProvider messages={MESSAGES}>
      {children}
    </DomainMessagesProvider>
  );
}
