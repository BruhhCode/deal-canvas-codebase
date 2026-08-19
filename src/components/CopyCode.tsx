import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CopyCode({ code, className }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      /* clipboard unavailable */
    }
    setCopied(true);
    toast.success(`Code ${code} copied`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-sm border border-dashed border-foreground/30 bg-cream px-3 py-2 text-sm font-semibold tracking-[0.12em] transition-colors hover:border-clay hover:text-clay",
        className,
      )}
    >
      <span>{code}</span>
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}
