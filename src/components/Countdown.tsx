import { useEffect, useState } from "react";

function format(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function Countdown({ hours }: { hours: number }) {
  const [left, setLeft] = useState(hours * 3600 * 1000);

  useEffect(() => {
    setLeft(hours * 3600 * 1000);
    const id = setInterval(() => setLeft((v) => Math.max(0, v - 1000)), 1000);
    return () => clearInterval(id);
  }, [hours]);

  return (
    <span className="font-mono text-sm tabular-nums text-clay">Ends in {format(left)}</span>
  );
}
