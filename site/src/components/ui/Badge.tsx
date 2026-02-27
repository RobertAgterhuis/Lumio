interface BadgeProps {
  children: React.ReactNode;
  variant?: "teal" | "sage" | "neutral";
}

const variants = {
  teal:    "bg-[var(--color-primary-100)] text-[var(--color-primary-700)]",
  sage:    "bg-[var(--color-sage-100)]    text-[var(--color-sage-600)]",
  neutral: "bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]",
};

export default function Badge({ children, variant = "teal" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${variants[variant]}`}>
      {children}
    </span>
  );
}
