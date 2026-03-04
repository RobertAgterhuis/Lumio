import type { ReactNode } from "react";
import { DomainMessagesProvider } from "@/components/providers/DomainMessagesProvider";
import type { AbstractIntlMessages } from "next-intl";
import nlMessages from "@messages/nl/testament.json";
import enMessages from "@messages/en/testament.json";
// juridischeCheck + dataHandtekening etc. live in misc.json
import nlMisc from "@messages/nl/misc.json";
import enMisc from "@messages/en/misc.json";
// voorbeeldData lives in videoboodschappen.json
import nlVideo from "@messages/nl/videoboodschappen.json";
import enVideo from "@messages/en/videoboodschappen.json";

const MESSAGES: Record<string, AbstractIntlMessages> = {
  nl: { ...nlMessages, ...nlMisc, ...nlVideo } as AbstractIntlMessages,
  en: { ...enMessages, ...enMisc, ...enVideo } as AbstractIntlMessages,
};

export default function TestamentLayout({ children }: { children: ReactNode }) {
  return (
    <DomainMessagesProvider messages={MESSAGES}>
      {children}
    </DomainMessagesProvider>
  );
}
