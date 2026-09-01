import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchPlaceholders } from "@/data/products";

const TYPE_SPEED_MS = 55;
const DELETE_SPEED_MS = 30;
const HOLD_MS = 1400;
const GAP_MS = 400;

/** Cycles through `phrases`, typing each one in and deleting it back out, one character at a time. */
function useTypewriter(phrases: readonly string[]) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (!phrases.length) return;
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timeout: ReturnType<typeof setTimeout>;

    const tick = () => {
      const phrase = phrases[phraseIndex]!;
      if (!deleting) {
        charIndex++;
        setText(phrase.slice(0, charIndex));
        if (charIndex === phrase.length) {
          deleting = true;
          timeout = setTimeout(tick, HOLD_MS);
          return;
        }
        timeout = setTimeout(tick, TYPE_SPEED_MS);
      } else {
        charIndex--;
        setText(phrase.slice(0, charIndex));
        if (charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          timeout = setTimeout(tick, GAP_MS);
          return;
        }
        timeout = setTimeout(tick, DELETE_SPEED_MS);
      }
    };

    timeout = setTimeout(tick, TYPE_SPEED_MS);
    return () => clearTimeout(timeout);
  }, [phrases]);

  return text;
}

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
  const typed = useTypewriter(searchPlaceholders);
  const navigate = useNavigate();

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        navigate({ to: "/shop", search: { q: q.trim(), category: "", department: "", view: "", store: "" } });
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
          placeholder={typed}
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
