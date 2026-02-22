"use client";

import { Component } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
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
      return (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-center space-y-4 max-w-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold">Er is iets misgegaan</h2>
            <p className="text-sm text-muted-foreground">
              Er is een onverwachte fout opgetreden bij het laden van deze
              pagina. Probeer het opnieuw of ga terug naar het dashboard.
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => window.location.assign("/dashboard")}>
                Naar dashboard
              </Button>
              <Button onClick={this.handleRetry}>Opnieuw proberen</Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
