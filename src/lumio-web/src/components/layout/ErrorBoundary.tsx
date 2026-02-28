"use client";

import { Component } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
// ErrorBoundary uses only the shared bundle (common + errors namespaces).
// These are always present in the root bundle regardless of which domain is active.
import nlShared from "../../../messages/nl/shared.json";
import enShared from "../../../messages/en/shared.json";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

// Static message map — class components cannot use hooks.
// Only the `errors` and `common` namespaces are needed here; both are in shared.json.
const messagesByLocale: Record<string, typeof nlShared> = {
  nl: nlShared,
  en: enShared,
};

function getErrorTranslations() {
  const locale =
    typeof window !== "undefined"
      ? localStorage.getItem("lumio-locale") ?? "nl"
      : "nl";
  const messages = messagesByLocale[locale] ?? nlShared;
  return {
    title: messages.errors.ietsMisgegaan,
    description: messages.errors.onverwachteFout,
    dashboard: messages.common.naarDashboard,
    retry: messages.common.opnieuwProberen,
  };
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      const t = getErrorTranslations();
      return (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-center space-y-4 max-w-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold">{t.title}</h2>
            <p className="text-sm text-muted-foreground">{t.description}</p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => window.location.assign("/dashboard")}>
                {t.dashboard}
              </Button>
              <Button onClick={this.handleRetry}>{t.retry}</Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
