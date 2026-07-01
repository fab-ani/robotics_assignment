"use client";

import { useCallback, useState } from "react";

interface Props {
  onUpload: (file: File) => void;
  label?: string;
}

export default function ImageUploader({ onUpload, label = "Upload an Image" }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      setPreview(URL.createObjectURL(file));
      onUpload(file);
    },
    [onUpload]
  );

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium tracking-wide uppercase text-[#A1A1AA]">{label}</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
        className={`border border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          dragOver
            ? "border-[#FAFAFA] bg-[#FAFAFA]/5"
            : "border-[#27272A] hover:border-[#A1A1AA]"
        }`}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.onchange = () => { if (input.files?.[0]) handleFile(input.files[0]); };
          input.click();
        }}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded" />
        ) : (
          <div className="text-[#A1A1AA]">
            <p className="text-sm font-medium text-[#FAFAFA]">Click or drag an image here</p>
            <p className="text-xs mt-1">Supports JPG, PNG, BMP</p>
          </div>
        )}
      </div>
    </div>
  );
}
