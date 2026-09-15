import { useEffect, useState, type FormEvent } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { SectionHeading } from "./SectionHeading";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

type Review = {
  id: string;
  product_slug: string;
  author: string;
  rating: number;
  comment: string;
  created_at: string;
};

function StarRow({ rating, size = "h-4 w-4" }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={cn(size, n <= rating ? "fill-current text-clay" : "text-muted-foreground/30")} />
      ))}
    </div>
  );
}

/** Shopper-submitted ratings/reviews for a product — reads and writes Supabase's `reviews` table directly. */
export function ProductReviews({ productSlug }: { productSlug: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_slug", productSlug)
        .order("created_at", { ascending: false });
      if (!cancelled) {
        setReviews((data as Review[] | null) ?? []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productSlug]);

  const average = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      toast.error("Reviews aren't available right now.");
      return;
    }
    if (!comment.trim()) {
      toast.error("Write a few words before submitting.");
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase
      .from("reviews")
      .insert({
        product_slug: productSlug,
        author: author.trim() || "Anonymous",
        rating,
        comment: comment.trim(),
      })
      .select()
      .single();
    setSubmitting(false);
    if (error) {
      toast.error(`Couldn't post your review: ${error.message}`);
      return;
    }
    setReviews((prev) => [data as Review, ...prev]);
    setAuthor("");
    setRating(5);
    setComment("");
    toast.success("Thanks — your review is live.");
  };

  return (
    <section className="mt-16">
      <SectionHeading
        eyebrow="Reviews"
        title="Ratings & Reviews"
        description={
          average !== null
            ? `${average.toFixed(1)} average from ${reviews.length} review${reviews.length === 1 ? "" : "s"}`
            : "Be the first to review this product."
        }
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <form onSubmit={submit} className="h-fit space-y-4 rounded-lg border bg-card p-6">
          <div>
            <p className="editorial-eyebrow mb-2">Your rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  aria-label={`${n} star${n === 1 ? "" : "s"}`}
                  className="p-0.5"
                >
                  <Star
                    className={cn("h-6 w-6", n <= rating ? "fill-current text-clay" : "text-muted-foreground/30")}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="review-name" className="editorial-eyebrow mb-2 block">
              Name (optional)
            </label>
            <input
              id="review-name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Anonymous"
              maxLength={60}
              className="w-full rounded-sm border bg-background px-3 py-2 text-sm outline-none focus:border-clay"
            />
          </div>
          <div>
            <label htmlFor="review-comment" className="editorial-eyebrow mb-2 block">
              Review
            </label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="What did you think of this product?"
              maxLength={2000}
              className="w-full rounded-sm border bg-background px-3 py-2 text-sm outline-none focus:border-clay"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-sm bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-clay hover:text-clay-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Posting…" : "Post Review"}
          </button>
        </form>

        <div className="space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading reviews…</p>
          ) : reviews.length === 0 ? (
            <p className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
              No reviews yet — share your experience with this product.
            </p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="rounded-lg border bg-card p-5">
                <div className="flex items-center justify-between gap-3">
                  <StarRow rating={r.rating} />
                  <span className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold">{r.author}</p>
                <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{r.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
