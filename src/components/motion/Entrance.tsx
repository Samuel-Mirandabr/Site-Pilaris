"use client";
import { useEffect, useState } from "react";

export function Entrance({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { const id = requestAnimationFrame(() => setReady(true)); return () => cancelAnimationFrame(id); }, []);
  return <div className={className + (ready ? " motion-ready" : "")} style={{ "--motion-delay": delay + "ms" } as React.CSSProperties}>{children}</div>;
}
