// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // "hidden": generates real .map files for error-tracking/debugging use, but
  // omits the //# sourceMappingURL comment so browsers never auto-fetch them.
  vite: { build: { sourcemap: "hidden" } },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Hard-pin the deploy target to Vercel. Nitro is supposed to auto-detect this from
  // Vercel's own build environment, but the site was deploying "successfully" and then
  // crashing at runtime ("try again") on Vercel, which looks like a Cloudflare-shaped
  // output (wrangler.json, Workers runtime assumptions) being served by Vercel's
  // Node/Edge function runtime instead. Pinning removes the auto-detection as a variable.
  //
  // Security headers live here, not in a root vercel.json -- the vercel preset
  // generates its own .vercel/output/config.json from scratch at build time and
  // does not read/merge a source vercel.json, so a hand-written one is silently
  // ignored. routeRules headers are the mechanism nitro actually bakes into that
  // generated config (confirmed: the /assets/(.*) cache-control rule already in
  // the output comes from nitro's own default routeRules, the same way).
  nitro: {
    preset: "vercel",
    // @ts-expect-error -- the wrapper's nitro option type only declares
    // preset/output/cloudflare, but it forwards the whole object to nitro()
    // from nitro/vite, which does support routeRules (verified: this key
    // reaches .vercel/output/config.json as real per-route headers).
    routeRules: {
      "/**": {
        headers: {
          // Report-Only: logs violations instead of blocking, since dozens of
          // retailer CDNs serve product/brand images and enumerating every
          // host is fragile -- switch to enforcing once verified clean.
          "Content-Security-Policy-Report-Only":
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://oadbslzvblccshgwpyqh.supabase.co wss://oadbslzvblccshgwpyqh.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
          "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
          "X-Frame-Options": "DENY",
          "X-Content-Type-Options": "nosniff",
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
      },
    },
  },
});
