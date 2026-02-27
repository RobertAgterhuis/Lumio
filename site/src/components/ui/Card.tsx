import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  highlighted?: boolean;
}

export default function Card({ children, className = "", highlighted = false }: CardProps) {
  return (
    <div
      className={`rounded-[var(--radius-md)] p-6 ${
        highlighted
          ? "bg-[var(--color-primary-700)] text-white shadow-[var(--shadow-3)]"
          : "bg-white border border-[var(--color-neutral-100)] shadow-[var(--shadow-1)] hover:shadow-[var(--shadow-2)] transition-shadow"
      } ${className}`}
    >
      {children}
    </div>
  );
}
