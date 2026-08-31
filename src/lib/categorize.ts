/**
 * Maps a raw category/subcategory string (as it appears in scraped product
 * CSVs — free text like "girls-jeans", "women-dangle-earrings", "activewear")
 * onto the storefront's fixed shop-category taxonomy (src/data/products.ts
 * `shopCategories`), so every product lands in a category that Shop's
 * Department/Category filters actually know about.
 *
 * Without this, a raw CSV category_slug that isn't one of the ~25 canonical
 * slugs (the overwhelming majority, in practice — CSVs from different
 * scrapes never agree on category naming) silently fails every Department
 * and Category filter for that product: filterProducts() checks category
 * membership against shopCategories, so an unrecognized category means the
 * product can never match any Department/Category chip, even though it's
 * still findable by plain search.
 */

const KIDS_BRANDS = new Set(["carters", "oshkosh-bgosh", "the-childrens-place", "gap-kids"]);

const FOOTWEAR = /shoe|sneaker|sandal|boot|heel|loafer|footwear/i;
const BABY = /baby/i;

export type Gender = "women" | "men" | "unisex";

/** Canonical shop-category slug for a product, derived from its brand, raw category, subcategory, gender and name. */
export function canonicalCategory(input: {
  brand: string;
  rawCategory: string;
  subcategory: string;
  gender: Gender;
  name: string;
}): string {
  const { brand, rawCategory, subcategory, gender, name } = input;
  const text = `${rawCategory} ${subcategory} ${name}`.toLowerCase();
  const isMen = gender === "men";

  if (KIDS_BRANDS.has(brand) || /^(kids|baby|girls?|boys?)[-\s]/i.test(rawCategory) || rawCategory === "kids") {
    if (FOOTWEAR.test(text)) return "kids-shoes";
    if (BABY.test(text)) return "baby-clothing";
    return "kids-clothing";
  }

  if (/jewel|earring|necklace|bracelet/.test(text)) return "jewelry";
  if (/\bwatch/.test(text)) return isMen ? "mens-watches" : "watches";
  if (/fragrance|perfume|cologne/.test(text)) return isMen ? "grooming" : "beauty";
  if (/makeup|skincare|hair\s*care|\bbeauty\b/.test(text)) return isMen ? "grooming" : "beauty";
  if (/luggage|suitcase|\btravel\b/.test(text)) return "travel";
  if (/fitness|gym equipment/.test(text)) return "fitness";
  if (/\bbag|handbag|backpack|\btote|crossbody|wallet|clutch/.test(text)) return isMen ? "mens-bags" : "bags";
  if (FOOTWEAR.test(text)) return isMen ? "mens-shoes" : "shoes";
  if (/hair.?band|\baccessor/.test(text)) return isMen ? "mens-accessories" : "accessories";
  if (/sport|active|legging|jogger|\btrack|\bgym\b|training|tracksuit/.test(text)) {
    return isMen ? "mens-sportswear" : "sportswear";
  }

  return isMen ? "mens-clothing" : "clothing";
}
