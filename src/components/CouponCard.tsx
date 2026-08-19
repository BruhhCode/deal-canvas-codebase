import { Link } from "@tanstack/react-router";
import { type Coupon, brandName } from "@/data/catalog";
import { BrandMark } from "./BrandMark";
import { RevealCode } from "./RevealCode";
import { expiryLabel } from "@/data/catalog";

export function CouponCard({ coupon }: { coupon: Coupon }) {
  return (
    <article className="flex h-full flex-col gap-4 rounded-lg border bg-card p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <BrandMark slug={coupon.brand} />
          <div>
            <Link
              to="/brand/$slug"
              params={{ slug: coupon.brand }}
              className="text-sm font-semibold uppercase tracking-[0.14em] hover:text-clay"
            >
              {brandName(coupon.brand)}
            </Link>
            <p className="text-xs text-muted-foreground">{coupon.title}</p>
          </div>
        </div>
        <span className="whitespace-nowrap font-serif text-xl">{coupon.discount}</span>
      </div>

      <p className="text-sm text-muted-foreground">{coupon.description}</p>

      <div className="mt-auto space-y-3">
        <RevealCode code={coupon.code} brand={coupon.brand} />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {coupon.usedToday} used today · {coupon.successRate}% success
          </span>
          <span>{expiryLabel(coupon.expiresInHours)}</span>
        </div>
      </div>
    </article>
  );
}
