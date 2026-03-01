import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  highlighted?: boolean;
}

export default function Card({ children, className = "", highlighted = false }: CardProps) {
  return (
    <div
      className={`rounded-md p-6 ${
        highlighted
          ? "bg-primary-700 text-white shadow-(--shadow-3)"
          : "bg-white border border-neutral-100 shadow-(--shadow-1) hover:shadow-(--shadow-2) transition-shadow"
      } ${className}`}
    >
      {children}
    </div>
  );
}
