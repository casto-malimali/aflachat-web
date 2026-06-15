import { cn } from "@/lib/cn";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  /** Optional decorative numeral, e.g. "01". */
  num?: string;
  className?: string;
}

/** Shared icon + numeral + title + description card (Home "How It Works" & Services). */
export function FeatureCard({ icon, title, desc, num, className }: FeatureCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[1.5rem] border border-border bg-surface p-8",
        "shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg",
        className,
      )}
    >
      {/* warm wash that blooms on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-px h-1 origin-left scale-x-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-clay)] transition-transform duration-300 group-hover:scale-x-100"
      />
      {num && (
        <span
          aria-hidden
          className="absolute right-6 top-5 select-none font-display text-6xl font-semibold text-[var(--color-soil)]/[0.06]"
        >
          {num}
        </span>
      )}
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/10 bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-white">
        {icon}
      </div>
      <h3 className="mb-3 font-display text-xl font-semibold text-[var(--color-soil)]">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  );
}
