import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { api, ApiError } from "@/lib/api-client";
import { toast } from "@/stores/toastStore";
import { domainKeys } from "./useDomainQuery";

// Status query keys that must be refreshed after any domain data change
const STATUS_KEYS = [
  domainKeys.all("status/compleetheid"),
  domainKeys.all("status/meldingen"),
  domainKeys.all("status/actualisatie"),
];

function invalidateStatusKeys(queryClient: ReturnType<typeof useQueryClient>) {
  STATUS_KEYS.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
}

type MutationMethod = "create" | "update" | "delete";

interface UseDomainMutationOptions<TData, TVariables> {
  /** Show success toast on completion (default: true) */
  showSuccessToast?: boolean;
  /** Custom success message (uses feedback.opgeslagen/aangemaakt/verwijderd by default) */
  successMessage?: string;
  /** Additional query keys to invalidate on success */
  invalidateKeys?: readonly unknown[][];
  /** Additional callback on error */
  onError?: (error: ApiError) => void;
}

/**
 * Create a new domain entity.
 *
 * @example
 * ```tsx
 * const createBezit = useDomainCreate<FysiekBezit, CreateBezitDto>(
 *   "boedel/bezittingen"
 * );
 *
 * createBezit.mutate({ categorie: "Voertuig", omschrijving: "Auto" });
 * ```
 */
export function useDomainCreate<TData, TVariables>(
  endpoint: string,
  options?: UseDomainMutationOptions<TData, TVariables>
) {
  const queryClient = useQueryClient();
  const { showSuccessToast = true, successMessage, invalidateKeys, onError } = options ?? {};

  return useMutation<TData, ApiError, TVariables>({
    mutationFn: (data) => api.post<TData>(`/api/${endpoint}`, data),
    onSuccess: () => {
      // Invalidate list queries for this domain
      queryClient.invalidateQueries({ queryKey: domainKeys.all(endpoint) });
      // Refresh dashboard status data
      invalidateStatusKeys(queryClient);

      // Invalidate any additional specified keys
      if (invalidateKeys) {
        invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }

      if (showSuccessToast) {
        toast.success(successMessage ?? "Aangemaakt");
      }
    },
    onError,
  });
}

/**
 * Update an existing domain entity.
 *
 * @example
 * ```tsx
 * const updateBezit = useDomainUpdate<FysiekBezit, UpdateBezitDto>(
 *   "boedel/bezittingen"
 * );
 *
 * updateBezit.mutate({ id: bezitId, data: { omschrijving: "Nieuwe auto" } });
 * ```
 */
export function useDomainUpdate<TData, TVariables>(
  endpoint: string,
  options?: UseDomainMutationOptions<TData, { id: string; data: TVariables }>
) {
  const queryClient = useQueryClient();
  const { showSuccessToast = true, successMessage, invalidateKeys, onError } = options ?? {};

  return useMutation<TData, ApiError, { id: string; data: TVariables }>({
    mutationFn: ({ id, data }) => api.put<TData>(`/api/${endpoint}/${id}`, data),
    onSuccess: (_data, variables) => {
      // Invalidate list queries for this domain
      queryClient.invalidateQueries({ queryKey: domainKeys.all(endpoint) });
      // Invalidate the specific item
      queryClient.invalidateQueries({ queryKey: domainKeys.detail(endpoint, variables.id) });
      // Refresh dashboard status data
      invalidateStatusKeys(queryClient);

      // Invalidate any additional specified keys
      if (invalidateKeys) {
        invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }

      if (showSuccessToast) {
        toast.success(successMessage ?? "Opgeslagen");
      }
    },
    onError,
  });
}

/**
 * Delete a domain entity.
 *
 * @example
 * ```tsx
 * const deleteBezit = useDomainDelete("boedel/bezittingen");
 *
 * deleteBezit.mutate(bezitId);
 * ```
 */
export function useDomainDelete(
  endpoint: string,
  options?: UseDomainMutationOptions<void, string>
) {
  const queryClient = useQueryClient();
  const { showSuccessToast = true, successMessage, invalidateKeys, onError } = options ?? {};

  return useMutation<void, ApiError, string>({
    mutationFn: (id) => api.delete(`/api/${endpoint}/${id}`),
    onSuccess: (_data, id) => {
      // Invalidate list queries for this domain
      queryClient.invalidateQueries({ queryKey: domainKeys.all(endpoint) });
      // Remove the specific item from cache
      queryClient.removeQueries({ queryKey: domainKeys.detail(endpoint, id) });
      // Refresh dashboard status data
      invalidateStatusKeys(queryClient);

      // Invalidate any additional specified keys
      if (invalidateKeys) {
        invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }

      if (showSuccessToast) {
        toast.success(successMessage ?? "Verwijderd");
      }
    },
    onError,
  });
}

/**
 * Combined mutation hook for CRUD operations on a domain entity.
 * Provides create, update, and delete mutations with shared configuration.
 *
 * @example
 * ```tsx
 * const { create, update, remove } = useDomainMutations<FysiekBezit, BezitFormData>(
 *   "boedel/bezittingen"
 * );
 *
 * // Create
 * create.mutate(formData);
 *
 * // Update
 * update.mutate({ id: bezitId, data: formData });
 *
 * // Delete
 * remove.mutate(bezitId);
 * ```
 */
export function useDomainMutations<TData, TVariables>(
  endpoint: string,
  options?: {
    invalidateKeys?: readonly unknown[][];
    showSuccessToast?: boolean;
  }
) {
  const create = useDomainCreate<TData, TVariables>(endpoint, options);
  const update = useDomainUpdate<TData, TVariables>(endpoint, options);
  const remove = useDomainDelete(endpoint, options);

  return {
    create,
    update,
    remove,
    isLoading: create.isPending || update.isPending || remove.isPending,
  };
}

/**
 * Returns a stable callback that invalidates all dashboard status queries
 * (status/meldingen, status/compleetheid, status/actualisatie).
 *
 * Use this in any hook or page that calls the API directly (not via
 * useDomainCreate / useDomainUpdate / useDomainDelete) so the notification
 * bell and dashboard status cards stay in sync after every mutation.
 *
 * @example
 * ```tsx
 * const invalidateStatus = useInvalidateStatusKeys();
 * // after a successful api.post / api.put / api.delete:
 * await api.post("/api/some-endpoint", data);
 * invalidateStatus();
 * ```
 */
export function useInvalidateStatusKeys() {
  const queryClient = useQueryClient();
  return useCallback(() => {
    invalidateStatusKeys(queryClient);
  }, [queryClient]);
}
