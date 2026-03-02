interface SectionHeadingProps {
  badge?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
  /** Override the h2 text colour — use \"text-white\" when placed on a dark background */
  titleClassName?: string;
}

export default function SectionHeading({ badge, title, subtitle, centered = false, titleClassName }: SectionHeadingProps) {
  const align = centered ? "text-center items-center" : "text-left items-start";

  return (
    <div className={`flex flex-col gap-3 mb-10 ${align}`}>
      {badge && (
        <span className="inline-flex self-start rounded-full bg-primary-100 text-primary-700 px-3 py-1 text-xs font-semibold tracking-wide">
          {badge}
        </span>
      )}
      <h2 className={`font-display text-3xl md:text-4xl leading-tight ${titleClassName ?? "text-(--color-neutral-900)"}`}>
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg text-neutral-600 max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
