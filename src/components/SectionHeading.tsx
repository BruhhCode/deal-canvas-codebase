import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "View all",
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b pb-4">
      <div>
        {eyebrow ? <p className="editorial-eyebrow mb-2">{eyebrow}</p> : null}
        <h2 className="text-3xl md:text-4xl">{title}</h2>
        {description ? (
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
      {href ? (
        <Link
          to={href}
          className="text-xs font-semibold uppercase tracking-[0.16em] underline underline-offset-4 hover:text-clay"
        >
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}
