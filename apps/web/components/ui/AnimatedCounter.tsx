"use client";
import { useEffect, useState } from "react";
import { useInView } from "@/hooks/useInView";

/**
 * Conta de 0 até `to` com easing quando entra na viewport.
 * Server-component-friendly: aceita apenas props serializáveis.
 */
export function AnimatedCounter({
  to,
  duration = 800,
  decimals = 0,
  decimalSeparator = ",",
  className = "",
}: {
  to: number;
  duration?: number;
  decimals?: number;
  decimalSeparator?: string;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.4);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const t0 = performance.now();
    let raf = 0;
    function tick(now: number) {
      const t = Math.min((now - t0) / duration, 1);
      // easeOutCubic
      const eased = 1 - (1 - t) ** 3;
      setN(eased * to);
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  const display = decimals === 0
    ? String(Math.round(n))
    : n.toFixed(decimals).replace(".", decimalSeparator);

  return (
    <span ref={ref} className={`tnum ${className}`}>
      {display}
    </span>
  );
}
