import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchPlaceholders } from "@/data/products";

export function ProductSearch({
  size = "lg",
  className,
  initial = "",
}: {
  size?: "lg" | "sm";
  className?: string;
  initial?: string;
}) {
  const [q, setQ] = useState(initial);
  const [idx, setIdx] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const id = setInterval(() => setIdx((v) => (v + 1) % searchPlaceholders.length), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        navigate({ to: "/shop", search: { q: q.trim(), category: "", department: "", view: "" } });
      }}
      className={cn("w-full", className)}
    >
      <div
        className={cn(
          "flex w-full items-center gap-3 rounded-full border bg-card transition-colors focus-within:border-clay",
          size === "lg" ? "px-5 py-4" : "px-4 py-2.5",
        )}
      >
        <Search className={cn("shrink-0 text-muted-foreground", size === "lg" ? "h-5 w-5" : "h-4 w-4")} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search for products, brands or stores"
          placeholder={size === "lg" ? "Search for products, brands or stores..." : searchPlaceholders[idx]}
          className={cn(
            "w-full bg-transparent outline-none placeholder:text-muted-foreground",
            size === "lg" ? "text-base" : "text-sm",
          )}
        />
        <button
          type="submit"
          className={cn(
            "shrink-0 rounded-full bg-primary font-semibold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-clay hover:text-clay-foreground",
            size === "lg" ? "px-6 py-2.5 text-sm" : "px-4 py-1.5 text-xs",
          )}
        >
          Search
        </button>
      </div>
    </form>
  );
}
