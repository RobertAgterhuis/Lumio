import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api-client";

/**
 * Query key factory for domain entities.
 * Produces consistent keys: ['domain', domainName] or ['domain', domainName, id]
 */
export const domainKeys = {
  all: (domain: string) => ["domain", domain] as const,
  detail: (domain: string, id: string) => ["domain", domain, id] as const,
  list: (domain: string, params?: Record<string, unknown>) =>
    params ? (["domain", domain, "list", params] as const) : (["domain", domain, "list"] as const),
};

type UseDomainQueryOptions<T> = Omit<
  UseQueryOptions<T, ApiError>,
  "queryKey" | "queryFn"
>;

/**
 * Fetch a domain entity list from the API with React Query caching.
 *
 * @example
 * ```tsx
 * const { data: bezittingen, isLoading } = useDomainQuery<FysiekBezit[]>(
 *   "boedel/bezittingen"
 * );
 * ```
 *
 * @param endpoint - API endpoint path (without /api prefix), e.g. "boedel/bezittingen"
 * @param options - Additional React Query options
 */
export function useDomainQuery<T>(
  endpoint: string,
  options?: UseDomainQueryOptions<T>
) {
  return useQuery<T, ApiError>({
    queryKey: domainKeys.all(endpoint),
    queryFn: () => api.get<T>(`/api/${endpoint}`),
    ...options,
  });
}

/**
 * Fetch a single domain entity by ID.
 *
 * @example
 * ```tsx
 * const { data: bezit } = useDomainDetailQuery<FysiekBezit>(
 *   "boedel/bezittingen",
 *   bezitId
 * );
 * ```
 */
export function useDomainDetailQuery<T>(
  endpoint: string,
  id: string | undefined,
  options?: UseDomainQueryOptions<T>
) {
  return useQuery<T, ApiError>({
    queryKey: domainKeys.detail(endpoint, id ?? ""),
    queryFn: () => api.get<T>(`/api/${endpoint}/${id}`),
    enabled: !!id,
    ...options,
  });
}
