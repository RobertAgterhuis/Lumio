import type { ReactNode } from "react";
import { DomainMessagesProvider } from "@/components/providers/DomainMessagesProvider";
import type { AbstractIntlMessages } from "next-intl";
import nlMessages from "@messages/nl/digitaal-bezit.json";
import enMessages from "@messages/en/digitaal-bezit.json";
// wachtwoordGenerator lives in misc.json
import nlMisc from "@messages/nl/misc.json";
import enMisc from "@messages/en/misc.json";
// afsluitInstructies lives in export.json
import nlExport from "@messages/nl/export.json";
import enExport from "@messages/en/export.json";
// voorbeeldData lives in videoboodschappen.json
import nlVideo from "@messages/nl/videoboodschappen.json";
import enVideo from "@messages/en/videoboodschappen.json";

const MESSAGES: Record<string, AbstractIntlMessages> = {
  nl: { ...nlMessages, ...nlMisc, ...nlExport, ...nlVideo } as AbstractIntlMessages,
  en: { ...enMessages, ...enMisc, ...enExport, ...enVideo } as AbstractIntlMessages,
};

export default function DigitaalBezitLayout({ children }: { children: ReactNode }) {
  return (
    <DomainMessagesProvider messages={MESSAGES}>
      {children}
    </DomainMessagesProvider>
  );
}
