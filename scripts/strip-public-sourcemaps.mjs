// The nitro "vercel" preset copies the whole Vite build output (including
// .js.map files, since vite.config.ts sets build.sourcemap: "hidden" so the
// JS itself never references them) straight into .vercel/output/static,
// which Vercel serves publicly with no filtering step exposed through
// @lovable.dev/vite-tanstack-config's nitro option surface. Source maps
// reveal original filenames/comments (some of which document internal
// incident history), so this removes them from the publicly-servable
// directory after every build. If an error-tracking service (Sentry, etc.)
// is added later, its upload step should run *before* this script does.
import { readdir, rm } from "node:fs/promises";
import { join } from "node:path";

const dir = join(process.cwd(), ".vercel/output/static/assets");

let entries;
try {
  entries = await readdir(dir);
} catch {
  process.exit(0); // no build output (e.g. nitro/vercel preset skipped) -- nothing to do
}

const maps = entries.filter((f) => f.endsWith(".map"));
await Promise.all(maps.map((f) => rm(join(dir, f))));
console.log(`stripped ${maps.length} source map(s) from the public build output`);
