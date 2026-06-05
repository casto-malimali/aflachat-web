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
        "group relative rounded-xl border border-border bg-surface p-8",
        "transition-all duration-300 hover:border-primary/30 hover:shadow-md",
        className,
      )}
    >
      {num && (
        <span
          aria-hidden
          className="absolute right-7 top-6 select-none font-heading text-6xl font-black text-foreground/[0.04]"
        >
          {num}
        </span>
      )}
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg border border-primary/10 bg-accent text-primary transition-colors group-hover:bg-primary/10">
        {icon}
      </div>
      <h3 className="mb-3 font-heading text-xl font-bold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  );
}
