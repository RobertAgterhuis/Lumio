import { create } from "zustand";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  /** Add a toast notification */
  addToast: (toast: Omit<Toast, "id">) => string;
  /** Remove a toast by ID */
  removeToast: (id: string) => void;
  /** Remove all toasts */
  clearToasts: () => void;
}

let toastId = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${++toastId}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    return id;
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearToasts: () => set({ toasts: [] }),
}));

/** Convenience functions for showing toasts */
export const toast = {
  success: (message: string, duration?: number) =>
    useToastStore.getState().addToast({ message, variant: "success", duration }),
  error: (message: string, duration?: number) =>
    useToastStore.getState().addToast({ message, variant: "error", duration }),
  warning: (message: string, duration?: number) =>
    useToastStore.getState().addToast({ message, variant: "warning", duration }),
  info: (message: string, duration?: number) =>
    useToastStore.getState().addToast({ message, variant: "info", duration }),
};
