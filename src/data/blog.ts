import catFashion from "@/assets/cat-fashion.jpg";
import catBeauty from "@/assets/cat-beauty.jpg";
import catShoes from "@/assets/cat-shoes.jpg";
import catAccessories from "@/assets/cat-accessories.jpg";
import catLifestyle from "@/assets/cat-lifestyle.jpg";
import catTravel from "@/assets/cat-travel.jpg";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  published: string;
  author: string;
  image: string;
  body: string[];
}

export const blogCategories = ["Fashion", "Beauty", "Shopping Tips", "Lifestyle", "Trends"] as const;

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-actually-tell-if-a-sale-is-a-real-deal",
    title: "How to Actually Tell If a Sale Is a Real Deal",
    excerpt:
      "Inflated \"was\" prices are everywhere. Here's how to check whether a discount is genuine before you buy.",
    category: "Shopping Tips",
    readTime: "5 min",
    published: "2026-09-12",
    author: "DealsCanvas Editorial",
    image: catFashion,
    body: [
      "Retailers know shoppers respond to big percentage-off numbers, and a strike-through price is one of the easiest things to inflate. Before trusting a discount, check the item's price history — a site that's shown a product at the \"sale\" price for most of the last month isn't really discounting it.",
      "A quick way to sanity-check any deal: search the exact product name plus the word \"price history\" or use a browser extension that tracks it. If the current price matches what it's been for weeks, the surrounding banner is decoration, not a real markdown.",
      "Genuine deals tend to cluster around predictable moments — end-of-season clearance, a named sale event, or a retailer clearing stock ahead of a new collection. Discounts that appear with no clear reason and disappear just as suddenly are worth a second look before you check out.",
    ],
  },
  {
    slug: "capsule-wardrobe-on-a-budget",
    title: "Building a Capsule Wardrobe Without Overspending",
    excerpt: "Fewer pieces, worn more often — a practical approach to buying clothes you'll actually reach for.",
    category: "Fashion",
    readTime: "6 min",
    published: "2026-09-08",
    author: "DealsCanvas Editorial",
    image: catLifestyle,
    body: [
      "A capsule wardrobe isn't about owning less for its own sake — it's about every piece earning its place by pairing with several others. Before buying anything new, it's worth listing what you already own in the same category and asking whether the new piece adds a genuinely new combination.",
      "Neutral basics (a good white shirt, a well-cut pair of dark jeans, a versatile jacket) are worth paying closer to full price for, since they get worn constantly and outlast a season's trend cycle. Save the discount-hunting for statement pieces you'll wear less often.",
      "Track the categories you're missing rather than shopping by browsing — it's the single biggest lever against impulse buys that end up unworn.",
    ],
  },
  {
    slug: "skincare-routine-that-doesnt-need-ten-products",
    title: "A Skincare Routine That Doesn't Need Ten Products",
    excerpt: "Cleanser, moisturizer, SPF — why the simplest routine is usually the one that sticks.",
    category: "Beauty",
    readTime: "4 min",
    published: "2026-09-01",
    author: "DealsCanvas Editorial",
    image: catBeauty,
    body: [
      "It's easy to end up with a shelf of half-used products chasing a ten-step routine you saw online. Dermatologists consistently point to three non-negotiables: a gentle cleanser, a moisturizer suited to your skin type, and daily SPF — everything else is optional refinement, not a requirement.",
      "If you want to add one more step, a single active ingredient (like a retinoid or vitamin C serum) introduced slowly does more for most people than five new products at once. Layering too many actives together is a common cause of irritation, not better results.",
      "When a bundle deal comes up, check whether you'd actually use every item in it within its shelf life — a 40% discount on a product that expires unused isn't a saving.",
    ],
  },
  {
    slug: "sneaker-care-guide-make-them-last",
    title: "The Sneaker Care Guide: Make Them Last Twice as Long",
    excerpt: "Cleaning, rotation and storage habits that noticeably extend a sneaker's life.",
    category: "Fashion",
    readTime: "5 min",
    published: "2026-08-26",
    author: "DealsCanvas Editorial",
    image: catShoes,
    body: [
      "Wearing the same pair of sneakers every day is the fastest way to wear them out — the midsole foam needs roughly 24 hours to decompress between wears to keep its cushioning. Rotating two pairs, even both budget options, will outlast one pair worn daily.",
      "Most suede and leather sneakers benefit from a protective spray applied before the first wear, not after the first stain. Reapply every few months if you're wearing them regularly.",
      "Store sneakers away from direct sunlight and stuffed with paper (not left flat) to help them keep their shape — a cheap fix that meaningfully affects resale value if you ever sell them on.",
    ],
  },
  {
    slug: "when-do-prices-actually-drop-a-seasonal-calendar",
    title: "When Do Prices Actually Drop? A Seasonal Shopping Calendar",
    excerpt: "What tends to go on sale each month, so you're not buying at the most expensive point in the cycle.",
    category: "Shopping Tips",
    readTime: "7 min",
    published: "2026-08-19",
    author: "DealsCanvas Editorial",
    image: catTravel,
    body: [
      "Retail discounting follows a rhythm that repeats every year. Outerwear and boots are cheapest in late winter as stores clear season stock, swimwear and sandals are cheapest in late summer for the same reason, and January is consistently the strongest month for fitness and loungewear.",
      "Big named sale events are good for stocking up on basics you already know you'll use, but they're rarely the cheapest point for a specific item you have your eye on — that's more often a quiet markdown a few weeks after a new collection lands.",
      "Setting a price alert on the exact item, rather than waiting for a sale banner, tends to catch the real low point more reliably than shopping around named events.",
    ],
  },
  {
    slug: "accessorizing-on-a-budget",
    title: "Accessorizing on a Budget: Small Buys, Big Difference",
    excerpt: "How a handful of inexpensive accessories can refresh an entire wardrobe without a big spend.",
    category: "Trends",
    readTime: "4 min",
    published: "2026-08-11",
    author: "DealsCanvas Editorial",
    image: catAccessories,
    body: [
      "Accessories carry an outsized share of how an outfit reads — a belt, a bag or a scarf can shift the same base pieces from casual to polished. Because they're worn against different outfits constantly, it's one category where buying a slightly bolder or trend-led piece at a low price makes more sense than doing the same with clothing.",
      "Gold and silver-tone jewelry dates less than trend colors, so it's usually the safer place to spend a little more; costume pieces in a strong seasonal color are the better place to chase a discount.",
      "A well-chosen bag is the accessory most worth waiting for the right discount on, since it typically gets the heaviest daily use of anything in this category.",
    ],
  },
];
