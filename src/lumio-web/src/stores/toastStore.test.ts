import { beforeEach, describe, expect, it } from "vitest";

import { toast, useToastStore } from "./toastStore";

describe("useToastStore", () => {
  beforeEach(() => {
    useToastStore.getState().clearToasts();
  });

  // ── addToast ────────────────────────────────────────────────

  describe("addToast", () => {
    it("adds a toast and returns a generated id", () => {
      const id = useToastStore
        .getState()
        .addToast({ message: "Hello", variant: "success" });
      expect(id).toMatch(/^toast-\d+$/);
      expect(useToastStore.getState().toasts).toHaveLength(1);
      expect(useToastStore.getState().toasts[0].id).toBe(id);
    });

    it("stores message and variant correctly", () => {
      useToastStore
        .getState()
        .addToast({ message: "Error occurred", variant: "error" });
      const t = useToastStore.getState().toasts[0];
      expect(t.message).toBe("Error occurred");
      expect(t.variant).toBe("error");
    });

    it("assigns unique ids to successive toasts", () => {
      const id1 = useToastStore
        .getState()
        .addToast({ message: "A", variant: "info" });
      const id2 = useToastStore
        .getState()
        .addToast({ message: "B", variant: "warning" });
      expect(id1).not.toBe(id2);
      expect(useToastStore.getState().toasts).toHaveLength(2);
    });

    it("preserves optional duration when provided", () => {
      useToastStore
        .getState()
        .addToast({ message: "X", variant: "warning", duration: 3000 });
      expect(useToastStore.getState().toasts[0].duration).toBe(3000);
    });

    it("leaves duration undefined when not provided", () => {
      useToastStore
        .getState()
        .addToast({ message: "Y", variant: "info" });
      expect(useToastStore.getState().toasts[0].duration).toBeUndefined();
    });

    it("appends toasts in order", () => {
      useToastStore.getState().addToast({ message: "first", variant: "success" });
      useToastStore.getState().addToast({ message: "second", variant: "error" });
      const msgs = useToastStore.getState().toasts.map((t) => t.message);
      expect(msgs).toEqual(["first", "second"]);
    });
  });

  // ── removeToast ─────────────────────────────────────────────

  describe("removeToast", () => {
    it("removes a toast by its id", () => {
      const id = useToastStore
        .getState()
        .addToast({ message: "Remove me", variant: "success" });
      useToastStore.getState().removeToast(id);
      expect(useToastStore.getState().toasts).toHaveLength(0);
    });

    it("does not remove other toasts when targeting one id", () => {
      const id1 = useToastStore
        .getState()
        .addToast({ message: "Keep", variant: "info" });
      const id2 = useToastStore
        .getState()
        .addToast({ message: "Remove", variant: "error" });
      useToastStore.getState().removeToast(id2);
      expect(useToastStore.getState().toasts).toHaveLength(1);
      expect(useToastStore.getState().toasts[0].id).toBe(id1);
    });

    it("is a no-op for an unknown id", () => {
      useToastStore
        .getState()
        .addToast({ message: "A", variant: "success" });
      useToastStore.getState().removeToast("does-not-exist");
      expect(useToastStore.getState().toasts).toHaveLength(1);
    });

    it("is safe to call on an empty store", () => {
      expect(() =>
        useToastStore.getState().removeToast("ghost")
      ).not.toThrow();
    });
  });

  // ── clearToasts ─────────────────────────────────────────────

  describe("clearToasts", () => {
    it("removes all toasts at once", () => {
      useToastStore.getState().addToast({ message: "A", variant: "success" });
      useToastStore.getState().addToast({ message: "B", variant: "error" });
      useToastStore.getState().addToast({ message: "C", variant: "warning" });
      useToastStore.getState().clearToasts();
      expect(useToastStore.getState().toasts).toHaveLength(0);
    });

    it("is safe to call when store is already empty", () => {
      expect(() => useToastStore.getState().clearToasts()).not.toThrow();
      expect(useToastStore.getState().toasts).toHaveLength(0);
    });
  });
});

// ── toast convenience functions ───────────────────────────────────

describe("toast convenience functions", () => {
  beforeEach(() => {
    useToastStore.getState().clearToasts();
  });

  it("toast.success adds a success toast with the correct message", () => {
    toast.success("Opgeslagen!");
    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].variant).toBe("success");
    expect(toasts[0].message).toBe("Opgeslagen!");
  });

  it("toast.error adds an error toast", () => {
    toast.error("Mislukt!");
    const toasts = useToastStore.getState().toasts;
    expect(toasts[0].variant).toBe("error");
    expect(toasts[0].message).toBe("Mislukt!");
  });

  it("toast.warning adds a warning toast", () => {
    toast.warning("Let op!");
    const toasts = useToastStore.getState().toasts;
    expect(toasts[0].variant).toBe("warning");
  });

  it("toast.info adds an info toast", () => {
    toast.info("Ter informatie");
    const toasts = useToastStore.getState().toasts;
    expect(toasts[0].variant).toBe("info");
  });

  it("convenience functions pass optional duration to the store", () => {
    toast.success("Snel weg", 1500);
    expect(useToastStore.getState().toasts[0].duration).toBe(1500);
  });

  it("multiple shorthand calls accumulate in the store", () => {
    toast.success("one");
    toast.error("two");
    toast.warning("three");
    expect(useToastStore.getState().toasts).toHaveLength(3);
  });
});
