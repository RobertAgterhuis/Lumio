"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

/**
 * React Query provider with default configuration optimized for
 * Lumio's offline-first approach.
 *
 * Configuration:
 * - No background refetching (data only changes via user actions)
 * - No window focus refetching (unnecessary for local data)
 * - Retry disabled (local API calls should not need retries)
 * - 5-minute stale time (reasonable cache for local data)
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Local API - no need for background refetching
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            // Reasonable stale time for local data
            staleTime: 5 * 60 * 1000, // 5 minutes
            // Don't retry failed requests (local API)
            retry: false,
          },
          mutations: {
            // Don't retry failed mutations
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
