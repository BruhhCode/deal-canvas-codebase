import { useState } from "react";
import { CopyCode } from "./CopyCode";
import { brandUrl } from "@/data/catalog";

export function RevealCode({ code, brand }: { code: string; brand: string }) {
  const [shown, setShown] = useState(false);

  if (!shown) {
    return (
      <button
        type="button"
        onClick={() => setShown(true)}
        className="w-full rounded-sm bg-primary py-2.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-clay hover:text-clay-foreground"
      >
        Show Code
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <CopyCode code={code} />
      <a
        href={brandUrl(brand)}
        target="_blank"
        rel="nofollow sponsored noopener"
        className="block rounded-sm border border-input py-2.5 text-center text-sm font-semibold uppercase tracking-wider transition-colors hover:border-clay hover:text-clay"
      >
        Shop Now
      </a>
    </div>
  );
}
