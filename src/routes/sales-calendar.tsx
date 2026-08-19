import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StoreMark } from "@/components/StoreMark";
import { storeName } from "@/data/stores";
import { saleEvents, saleWindows } from "@/data/products";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sales-calendar")({
  head: () => ({
    meta: [
      { title: "Sales Calendar — Live & Upcoming Store Sales | DealCanvas" },
      {
        name: "description",
        content:
          "See which fashion and lifestyle sales are live today, starting tomorrow or landing this month across Nike, Adidas, Nordstrom, Revolve, Zara, Ulta Beauty and more.",
      },
      { property: "og:title", content: "Sales Calendar | DealCanvas" },
      { property: "og:description", content: "Plan your shopping around every upcoming sale window." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SalesCalendar,
});

function SalesCalendar() {
  const [win, setWin] = useState<string>("");
  const list = win ? saleEvents.filter((e) => e.window === win) : saleEvents;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Sales Calendar" }]} />
      <header className="mb-10 max-w-2xl">
        <p className="editorial-eyebrow">{saleEvents.length} tracked sale events</p>
        <h1 className="mt-3 text-4xl md:text-5xl">Sales Calendar</h1>
        <p className="mt-4 text-muted-foreground">
          Every live and upcoming store sale we're tracking, so you know whether to buy now or wait.
        </p>
      </header>

      <div className="mb-10 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setWin("")}
          className={cn(
            "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em]",
            !win && "border-foreground bg-foreground text-background",
          )}
        >
          All
        </button>
        {saleWindows.map((w) => (
          <button
            key={w.key}
            type="button"
            onClick={() => setWin(w.key)}
            className={cn(
              "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em]",
              win === w.key && "border-foreground bg-foreground text-background",
            )}
          >
            {w.label}
          </button>
        ))}
      </div>

      <div className="space-y-10">
        {saleWindows
          .filter((w) => !win || w.key === win)
          .map((w) => {
            const events = list.filter((e) => e.window === w.key);
            if (!events.length) return null;
            return (
              <section key={w.key}>
                <h2 className="mb-4 border-b pb-3 text-2xl">{w.label}</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {events.map((e) => (
                    <Link
                      key={e.id}
                      to="/store/$slug"
                      params={{ slug: e.store }}
                      className="group rounded-lg border bg-card p-5 transition-colors hover:border-clay"
                    >
                      <div className="flex items-center gap-3">
                        <StoreMark slug={e.store} size="md" />
                        <span className="text-xs font-semibold uppercase tracking-[0.14em]">
                          {storeName(e.store)}
                        </span>
                      </div>
                      <h3 className="mt-4 text-xl group-hover:text-clay">{e.title}</h3>
                      <p className="mt-1 text-sm font-semibold text-clay">{e.discount}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{e.detail}</p>
                      {e.code ? (
                        <p className="mt-3 inline-block rounded-sm border border-dashed px-3 py-1 font-mono text-xs">
                          {e.code}
                        </p>
                      ) : null}
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
      </div>
    </div>
  );
}
