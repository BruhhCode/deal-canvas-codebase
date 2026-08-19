import { useCallback, useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const KEY = "dc_wishlist";

const read = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
};

export function useWishlist() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(read());
    const sync = () => setIds(read());
    window.addEventListener("dc-wishlist", sync);
    return () => window.removeEventListener("dc-wishlist", sync);
  }, []);

  const toggle = useCallback((id: string) => {
    const next = read().includes(id) ? read().filter((x) => x !== id) : [...read(), id];
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("dc-wishlist"));
  }, []);

  return { ids, toggle };
}

export function WishlistButton({ id, className }: { id: string; className?: string }) {
  const { ids, toggle } = useWishlist();
  const saved = ids.includes(id);

  return (
    <button
      type="button"
      aria-label={saved ? "Remove from wishlist" : "Save deal"}
      aria-pressed={saved}
      onClick={() => toggle(id)}
      className={cn(
        "z-10 rounded-full bg-background/90 p-2 text-foreground backdrop-blur transition-colors hover:text-clay",
        className,
      )}
    >
      <Heart className={cn("h-4 w-4", saved && "fill-clay text-clay")} />
    </button>
  );
}
