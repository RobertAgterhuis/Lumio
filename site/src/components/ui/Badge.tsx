interface BadgeProps {
  children: React.ReactNode;
  variant?: "teal" | "sage" | "neutral";
}

const variants = {
  teal:    "bg-primary-100 text-primary-700",
  sage:    "bg-sage-100    text-sage-600",
  neutral: "bg-neutral-100 text-neutral-600",
};

export default function Badge({ children, variant = "teal" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${variants[variant]}`}>
      {children}
    </span>
  );
}
