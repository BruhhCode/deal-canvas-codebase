import { useRef, useState } from "react";
import { toast } from "sonner";
import BellToggle from "./BellToggle";

const segments = ["Fashion", "Beauty", "Lifestyle", "Deals", "Coupons"];

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [picked, setPicked] = useState<string[]>(["Fashion", "Deals"]);
  const [subscribed, setSubscribed] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  function trySubscribe() {
    if (!emailRef.current?.reportValidity()) return;
    toast.success("You're subscribed", {
      description: `Preferences: ${picked.join(", ") || "All deals"}`,
    });
    setSubscribed(true);
  }

  return (
    <section className="bg-ink px-6 py-16 text-background md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="editorial-eyebrow text-background/60">Newsletter</p>
        <h2 className="mt-3 text-4xl text-background md:text-5xl">Never Miss a Great Deal</h2>
        <p className="mt-4 text-sm text-background/70">
          Get the best fashion, lifestyle and shopping offers delivered to your inbox.
        </p>

        <form
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:items-stretch"
          onSubmit={(e) => {
            e.preventDefault();
            trySubscribe();
          }}
        >
          <input
            ref={emailRef}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            aria-label="Email address"
            className="flex-1 rounded-sm border border-background/25 bg-transparent px-4 py-3 text-sm text-background placeholder:text-background/40 focus:border-clay focus:outline-none"
          />
          <BellToggle
            pressed={subscribed}
            onChange={(next) => {
              if (next) trySubscribe();
            }}
            offLabel="Subscribe"
            onLabel="Subscribed"
            label="Subscribe to the newsletter"
            size="lg"
            badge={false}
            background="var(--background)"
            color="var(--foreground)"
            onBackground="var(--clay)"
            onColor="var(--clay-foreground)"
            className="self-center"
          />
        </form>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {segments.map((s) => {
            const on = picked.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => setPicked(on ? picked.filter((p) => p !== s) : [...picked, s])}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  on
                    ? "border-clay bg-clay text-clay-foreground"
                    : "border-background/30 text-background/70 hover:border-background"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
