import { useEffect, useMemo, useState } from "react";

// Ambiance pixel : poussières, scintillements, pièces, bougies, dragon
export function Dust({ count = 28 }: { count?: number }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 1 + Math.round(Math.random() * 2),
        delay: Math.random() * 8,
        dur: 6 + Math.random() * 10,
      })),
    [count],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((d) => (
        <span
          key={d.id}
          className="absolute block animate-crypte-dust"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: `${d.size}px`,
            height: `${d.size}px`,
            background: "#F5D06A",
            boxShadow: "0 0 6px #F5D06A",
            animationDelay: `-${d.delay}s`,
            animationDuration: `${d.dur}s`,
          }}
        />
      ))}
    </div>
  );
}

export function Coin({ delay = 0 }: { delay?: number }) {
  return (
    <span
      className="inline-block animate-crypte-spin"
      style={{ animationDelay: `-${delay}s` }}
      aria-hidden
    >
      🪙
    </span>
  );
}

export function Candle() {
  return (
    <div className="flex flex-col items-center text-[10px] leading-none">
      <span className="animate-crypte-flame text-base" aria-hidden>🕯</span>
    </div>
  );
}

export function Dragon() {
  return (
    <div className="relative inline-flex items-center gap-2">
      <span className="text-3xl md:text-4xl animate-crypte-breath inline-block" aria-hidden>
        🐉
      </span>
      <span className="absolute -top-3 left-6 text-xs opacity-50 animate-crypte-smoke" aria-hidden>
        ☁
      </span>
    </div>
  );
}

export function Well({ pourcent }: { pourcent: number }) {
  return (
    <div className="relative mx-auto h-28 w-20 overflow-hidden border-2 border-[#4AB8B8]/50 rounded-md bg-[#0F1115] shadow-[inset_0_0_12px_#4AB8B8]">
      <div
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#4AB8B8] to-[#5FC7FF] animate-crypte-water"
        style={{ height: `${Math.min(100, Math.max(0, pourcent))}%` }}
      />
      <div className="absolute inset-0 flex items-end justify-center pb-1 text-[10px] pixel text-[#F5F0E8] drop-shadow-[1px_1px_0_#000]">
        {Math.round(pourcent)}%
      </div>
    </div>
  );
}

export function Sparkle({ trigger }: { trigger: number }) {
  const [bursts, setBursts] = useState<number[]>([]);
  useEffect(() => {
    if (!trigger) return;
    const id = Date.now();
    setBursts((b) => [...b, id]);
    const t = setTimeout(() => setBursts((b) => b.filter((x) => x !== id)), 1500);
    return () => clearTimeout(t);
  }, [trigger]);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {bursts.map((b) => (
        <div key={b} className="absolute inset-0">
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={i}
              className="absolute text-[10px] animate-crypte-coin-fall"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `-10%`,
                animationDelay: `${i * 0.05}s`,
              }}
            >
              {Math.random() > 0.5 ? "🪙" : "✨"}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
