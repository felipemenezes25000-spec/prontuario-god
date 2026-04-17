"use client";
import { useEffect, useRef } from "react";
import { CbdMolecule } from "./Molecule";

/**
 * Wrapper que faz a molécula reagir ao mouse com parallax 3D suave.
 * Ignora se o usuário tem reduced-motion.
 */
export function InteractiveMolecule({ size = 480 }: { size?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;

    function onMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      targetX = (e.clientX - cx) / rect.width;
      targetY = (e.clientY - cy) / rect.height;
    }

    function tick() {
      curX += (targetX - curX) * 0.06;
      curY += (targetY - curY) * 0.06;
      el!.style.transform = `perspective(1000px) rotateX(${(-curY * 14).toFixed(2)}deg) rotateY(${(curX * 14).toFixed(2)}deg) translateZ(0)`;
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="will-change-transform transition-transform duration-200 origin-center">
      <CbdMolecule size={size} accent="#C89B5C" stroke="#5BC07A" className="text-leaf w-full" />
    </div>
  );
}
