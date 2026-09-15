// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
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
  nitro: { preset: "vercel" },
});
