import { useState } from "react";
import { CopyCode } from "./CopyCode";

export function RevealCode({ code }: { code: string }) {
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
        href="https://track.dealcanvas.example/click"
        target="_blank"
        rel="nofollow sponsored noopener"
        className="block rounded-sm border border-input py-2.5 text-center text-sm font-semibold uppercase tracking-wider transition-colors hover:border-clay hover:text-clay"
      >
        Shop Now
      </a>
    </div>
  );
}
