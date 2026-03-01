"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="text-sm font-semibold text-[var(--color-primary-700)] hover:underline"
    >
      Afdrukken / opslaan als PDF →
    </button>
  );
}
