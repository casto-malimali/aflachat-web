import { cn } from "@/lib/cn";
import { Container } from "./Container";

type Align = "left" | "center";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  eyebrow?: string;
  title?: string;
  align?: Align;
  /** Set false to render children without the centered Container wrapper. */
  contained?: boolean;
}

/**
 * Standard page section — enforces the single vertical-rhythm scale
 * (py-16 / md:py-20 / lg:py-28) and the eyebrow + accent-rule + title pattern.
 */
export function Section({
  eyebrow,
  title,
  align = "left",
  contained = true,
  className,
  children,
  ...props
}: SectionProps) {
  const header = (eyebrow || title) && (
    <div className={cn("mb-12 md:mb-16", align === "center" && "text-center")}>
      {eyebrow && <span className="eyebrow mb-4">{eyebrow}</span>}
      {title && (
        <>
          <div className={cn("rule-accent mb-4", align === "center" && "mx-auto")} />
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">{title}</h2>
        </>
      )}
    </div>
  );

  return (
    <section className={cn("scroll-mt-24 py-16 md:py-20 lg:py-28", className)} {...props}>
      {contained ? (
        <Container>
          {header}
          {children}
        </Container>
      ) : (
        <>
          {header}
          {children}
        </>
      )}
    </section>
  );
}
