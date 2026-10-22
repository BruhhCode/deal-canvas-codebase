import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts } from "@tanstack/react-router";
import { Suspense, lazy, useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
// Preloaded below: these are the only 3 font files PageSpeed Insights'
// critical-path trace actually shows loading before first paint (Poppins
// 400 for body text, Poppins 600 for semibold UI like the search button/
// eyebrows, Playfair Display 500 for h1/h2/h3 — see styles.css's
// `font-weight: 500` heading rule). Without a preload hint they only get
// discovered once the browser has parsed styles.css and resolved the
// @font-face rules inside it, adding a full extra round trip to the chain.
import poppins400 from "@fontsource/poppins/files/poppins-latin-400-normal.woff2?url";
import poppins600 from "@fontsource/poppins/files/poppins-latin-600-normal.woff2?url";
import playfair500 from "@fontsource/playfair-display/files/playfair-display-latin-500-normal.woff2?url";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import { CurrencyProvider } from "@/lib/currency";
import { initLiveCatalog } from "@/lib/live-catalog";
import { useActiveTheme } from "@/lib/site-theme";

// Lazy: nobody outside the Christmas theme should pay for this component's
// code at all, not even as an unused import in the main bundle.
const SnowfallEffect = lazy(() => import("@/components/SnowfallEffect"));

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "DealsCanvas — Fashion & Lifestyle Deals, Coupons and Offers" },
      {
        name: "description",
        content:
          "Discover today's best fashion, beauty and lifestyle deals, coupons and promo codes from the brands you love — all in one place.",
      },
      { property: "og:site_name", content: "DealsCanvas" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      // Site-ownership verification tag — must render on every page, unmodified.
      { name: "fo-verify", content: "cc177968-384c-457e-92c1-c9aff49f6bed" },
      // Google Search Console site-ownership verification.
      { name: "google-site-verification", content: "IRe2AjFO0SAZPksSsAHie4YR1a2VeyaTBsAuz9qjeTE" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "preload", as: "font", type: "font/woff2", crossOrigin: "anonymous", href: poppins400 },
      { rel: "preload", as: "font", type: "font/woff2", crossOrigin: "anonymous", href: poppins600 },
      { rel: "preload", as: "font", type: "font/woff2", crossOrigin: "anonymous", href: playfair500 },
      { rel: "stylesheet", href: appCss },
    ],
    scripts: [
      // Google tag (gtag.js) — GA4.
      { src: "https://www.googletagmanager.com/gtag/js?id=G-EN6JX5S386", async: true },
      {
        children: [
          "window.dataLayer = window.dataLayer || [];",
          "function gtag(){dataLayer.push(arguments);}",
          "gtag('js', new Date());",
          "gtag('config', 'G-EN6JX5S386');",
        ].join("\n"),
      },
      // Google Tag Manager — the noscript <iframe> companion lives in
      // RootShell, right after <body> opens (GTM requires both).
      {
        children: [
          "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':",
          "new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],",
          "j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=",
          "'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);",
          "})(window,document,'script','dataLayer','GTM-TNMHM3TH');",
        ].join("\n"),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "DealsCanvas",
          description: "Fashion and lifestyle deal aggregator.",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {/* Google Tag Manager (noscript) — pairs with the GTM script in head(); must be
            the first thing in <body> per Google's own install instructions. */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TNMHM3TH"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const theme = useActiveTheme();

  useEffect(() => {
    initLiveCatalog();
  }, []);

  // RootShell (the actual <html> element) renders once per request and has
  // no reactive access to this client-fetched value, so the attribute is
  // written directly to the DOM here instead of through a prop/render path.
  useEffect(() => {
    if (theme === "default") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
            <Outlet />
          </main>
          <Footer />
        </div>
        <Toaster position="bottom-right" />
        {theme === "christmas" ? (
          <Suspense fallback={null}>
            <SnowfallEffect />
          </Suspense>
        ) : null}
      </CurrencyProvider>
    </QueryClientProvider>
  );
}
