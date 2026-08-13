import Image from "next/image";
import type { ReactNode } from "react";

/**
 * Full-bleed page banner: photo, dark scrim, accent rule, title and subtitle.
 *
 * Extracted from the Services page so every section header looks the same.
 * Purely presentational and hook-free, so it works inside both server
 * components (the blog pages) and client components (contact).
 */
export function PageHero({
  title,
  subtitle,
  image = "/images/2148761810.jpg",
  imageAlt,
  children,
  priority = true,
}: {
  title: string;
  subtitle?: string;
  /** Background photograph. Defaults to the maize field used on Services. */
  image?: string;
  /** Describe the photo; it is decorative only when the caller passes "". */
  imageAlt: string;
  /** Optional extra content under the subtitle (chips, buttons). */
  children?: ReactNode;
  priority?: boolean;
}) {
  return (
    <section className="relative h-[50vh] min-h-[340px] overflow-hidden">
      <Image
        src={image}
        alt={imageAlt}
        fill
        // Full-bleed at every breakpoint, so the browser should not downscale.
        sizes="100vw"
        priority={priority}
        className="object-cover"
      />

      {/* Scrim: keeps white text legible over an arbitrary photograph. */}
      <div className="absolute inset-0 bg-zinc-900/60 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full animate-fade-up">
          <div className="rule-accent mb-4 bg-secondary" />
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{title}</h1>
          {subtitle && <p className="text-lg text-zinc-300 max-w-xl">{subtitle}</p>}
          {children}
        </div>
      </div>
    </section>
  );
}
