"use client";

import { useEffect, useState } from "react";

interface Props {
  active: boolean;
  label?: string;
}

export default function LoadingOverlay({ active, label = "Processing" }: Props) {
  const [dots, setDots] = useState(0);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setDots((d) => (d + 1) % 4), 400);
    return () => clearInterval(id);
  }, [active]);

  if (!active) return null;

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-6">
      {/* Spinning rings */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border border-[#27272A] animate-[spin_2.5s_linear_infinite]" />
        <div className="absolute inset-2 rounded-full border border-transparent border-t-[#A1A1AA] border-r-[#A1A1AA] animate-[spin_1.5s_linear_infinite_reverse]" />
        <div className="absolute inset-4 rounded-full border border-transparent border-b-[#FAFAFA] border-l-[#A1A1AA] animate-[spin_1s_linear_infinite]" />
        <div className="absolute inset-6 rounded-full bg-[#FAFAFA] animate-pulse" />
      </div>
      {/* Label */}
      <p className="text-xs font-mono tracking-widest uppercase text-[#A1A1AA]">
        {label}{".".repeat(dots)}
      </p>
      {/* Progress bar */}
      <div className="w-48 h-px bg-[#27272A] rounded-full overflow-hidden">
        <div className="h-full bg-[#FAFAFA] rounded-full animate-[loading-bar_2s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}
