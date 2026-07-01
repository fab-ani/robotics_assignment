"use client";

import { useState } from "react";

interface Asset {
  name: string;
  file: string;
}

const ASSETS: Asset[] = [
  { name: "Automation Lab Sign", file: "PXL_20260628_161040497.jpg" },
  { name: "Mechatronics Lab", file: "PXL_20260629_060531564.jpg" },
  { name: "Kilimanjaro Bottle", file: "PXL_20260629_120039919.jpg" },
];

interface Props {
  onSelect: (file: File) => void;
  label?: string;
  filter?: string;
}

export default function AssetPicker({ onSelect, label = "Select an Image" }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSelect(asset: Asset) {
    setSelected(asset.file);
    setLoading(true);
    try {
      const res = await fetch(`/assets/${asset.file}`);
      const blob = await res.blob();
      const file = new File([blob], asset.file, { type: blob.type });
      onSelect(file);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-[10px] font-mono tracking-widest uppercase text-[#A1A1AA]">{label}</label>
      <div className="grid grid-cols-3 gap-4">
        {ASSETS.map((asset) => (
          <button
            key={asset.file}
            onClick={() => handleSelect(asset)}
            disabled={loading}
            className={`group relative rounded overflow-hidden border transition-all ${
              selected === asset.file
                ? "border-[#FAFAFA] ring-1 ring-[#FAFAFA]"
                : "border-[#27272A] hover:border-[#A1A1AA]"
            }`}
          >
            <img
              src={`/assets/${asset.file}`}
              alt={asset.name}
              className="w-full aspect-[4/3] object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <p className="text-[9px] font-mono tracking-wider uppercase text-[#FAFAFA] truncate">
                {asset.name}
              </p>
            </div>
            {selected === asset.file && (
              <div className="absolute top-1.5 right-1.5 w-3 h-3 bg-[#FAFAFA] rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-[#09090B] rounded-full" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
