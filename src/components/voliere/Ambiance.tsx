import { useEffect, useMemo, useState } from "react";

export function Feathers() {
  // Quelques plumes qui tombent
  const feathers = Array.from({ length: 12 });
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {feathers.map((_, i) => {
        const left = (i * 8.3 + 4) % 100;
        const duration = 14 + (i % 5) * 4;
        const delay = (i * 1.7) % 10;
        return (
          <div
            key={i}
            className="animate-feather absolute text-ivory/40"
            style={{
              left: `${left}%`,
              fontSize: `${12 + (i % 3) * 4}px`,
              animationDuration: `${duration}s`,
              animationDelay: `-${delay}s`,
            }}
          >
            🪶
          </div>
        );
      })}
    </div>
  );
}

const PERCHES = ["🌿 ", "📜 ", "✨ ", "🪵 "];
export function Oiseau({ delay = 0 }: { delay?: number }) {
  const [perch, setPerch] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPerch((p) => (p + 1) % PERCHES.length), 5000 + delay);
    return () => clearInterval(t);
  }, [delay]);
  return (
    <span className="inline-flex items-center gap-1 animate-wing">
      <span className="opacity-60">{PERCHES[perch]}</span>
      <span>🕊</span>
    </span>
  );
}

export function Lantern() {
  return <span className="animate-flicker inline-block">🕯</span>;
}

export function useFloatingDust(count = 18) {
  return useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 2 + Math.random() * 3,
        delay: Math.random() * 5,
      })),
    [count],
  );
}
