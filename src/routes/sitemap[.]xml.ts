import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { brands, categories, deals, guides, seasonalSales } from "@/data/catalog";
import { products, shopCategories } from "@/data/products";
import { stores } from "@/data/stores";

// TODO: replace with your project URL once a project name or custom domain is set.
const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const paths = [
          "/",
          "/deals",
          "/coupons",
          "/brands",
          "/guides",
          "/flash-deals",
          "/sale",
          "/shop",
          "/stores",
          "/sales-calendar",
          ...shopCategories.map((c) => `/shop?category=${c.slug}`),
          ...stores.map((st) => `/store/${st.slug}`),
          ...products.map((pr) => `/product/${pr.slug}`),
          ...categories.map((c) => `/category/${c.slug}`),
          ...brands.map((b) => `/brand/${b.slug}`),
          ...deals.map((d) => `/deal/${d.slug}`),
          ...guides.map((g) => `/guides/${g.slug}`),
          ...seasonalSales.map((s) => `/sale/${s.slug}`),
        ];

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...paths.map((p) => `  <url>\n    <loc>${BASE_URL}${p}</loc>\n  </url>`),
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
