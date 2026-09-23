/** Canonical host — the bare domain redirects here, so every absolute URL we emit should use it directly. */
export const SITE_URL = "https://www.dealscanvas.com";

/** Builds an absolute URL for `og:url`/canonical links/sitemap entries from a site-relative path. */
export const absoluteUrl = (path: string): string => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
