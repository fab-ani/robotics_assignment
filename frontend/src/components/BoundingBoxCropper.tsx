"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Props {
  imageSrc: string;
  crop: CropRect;
  onChange: (crop: CropRect) => void;
}

type Handle = "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w" | "move" | null;

export default function BoundingBoxCropper({ imageSrc, crop, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [naturalSize, setNaturalSize] = useState({ w: 1, h: 1 });
  const [displaySize, setDisplaySize] = useState({ w: 1, h: 1 });
  const [dragging, setDragging] = useState<Handle>(null);
  const [dragStart, setDragStart] = useState({ mx: 0, my: 0, rect: crop });
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });

  const scaleX = displaySize.w / naturalSize.w;
  const scaleY = displaySize.h / naturalSize.h;

  const updateDisplaySize = useCallback(() => {
    if (imgRef.current) {
      setDisplaySize({ w: imgRef.current.clientWidth, h: imgRef.current.clientHeight });
    }
  }, []);

  useEffect(() => {
    updateDisplaySize();
    window.addEventListener("resize", updateDisplaySize);
    return () => window.removeEventListener("resize", updateDisplaySize);
  }, [updateDisplaySize]);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    setDisplaySize({ w: img.clientWidth, h: img.clientHeight });
    if (crop.w === 0 && crop.h === 0) {
      onChange({ x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight });
    }
  }

  function clampRect(r: CropRect): CropRect {
    let { x, y, w, h } = r;
    x = Math.max(0, Math.round(x));
    y = Math.max(0, Math.round(y));
    w = Math.max(10, Math.round(w));
    h = Math.max(10, Math.round(h));
    if (x + w > naturalSize.w) w = naturalSize.w - x;
    if (y + h > naturalSize.h) h = naturalSize.h - y;
    if (x + w > naturalSize.w) x = naturalSize.w - w;
    if (y + h > naturalSize.h) y = naturalSize.h - h;
    return { x, y, w, h };
  }

  function getMousePos(e: React.MouseEvent | MouseEvent) {
    const rect = imgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: (e.clientX - rect.left) / scaleX, y: (e.clientY - rect.top) / scaleY };
  }

  function onMouseDownHandle(e: React.MouseEvent, handle: Handle) {
    e.stopPropagation();
    e.preventDefault();
    setDragging(handle);
    const pos = getMousePos(e);
    setDragStart({ mx: pos.x, my: pos.y, rect: { ...crop } });
  }

  function onContainerMouseDown(e: React.MouseEvent) {
    if (dragging) return;
    const target = e.target as HTMLElement;
    if (target.dataset.handle) return;
    const pos = getMousePos(e);
    setIsDrawing(true);
    setDrawStart({ x: pos.x, y: pos.y });
    onChange(clampRect({ x: pos.x, y: pos.y, w: 1, h: 1 }));
  }

  useEffect(() => {
    if (!dragging && !isDrawing) return;

    function onMove(e: MouseEvent) {
      const pos = getMousePos(e);
      if (isDrawing) {
        const x = Math.min(drawStart.x, pos.x);
        const y = Math.min(drawStart.y, pos.y);
        const w = Math.abs(pos.x - drawStart.x);
        const h = Math.abs(pos.y - drawStart.y);
        onChange(clampRect({ x, y, w, h }));
        return;
      }
      const dx = pos.x - dragStart.mx;
      const dy = pos.y - dragStart.my;
      const r = { ...dragStart.rect };
      switch (dragging) {
        case "move": r.x += dx; r.y += dy; break;
        case "nw": r.x += dx; r.y += dy; r.w -= dx; r.h -= dy; break;
        case "ne": r.y += dy; r.w += dx; r.h -= dy; break;
        case "sw": r.x += dx; r.w -= dx; r.h += dy; break;
        case "se": r.w += dx; r.h += dy; break;
        case "n": r.y += dy; r.h -= dy; break;
        case "s": r.h += dy; break;
        case "w": r.x += dx; r.w -= dx; break;
        case "e": r.w += dx; break;
      }
      onChange(clampRect(r));
    }

    function onUp() { setDragging(null); setIsDrawing(false); }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [dragging, isDrawing, dragStart, drawStart, scaleX, scaleY]);

  const boxStyle = {
    left: crop.x * scaleX,
    top: crop.y * scaleY,
    width: crop.w * scaleX,
    height: crop.h * scaleY,
  };

  const handleSize = 8;
  const half = handleSize / 2;

  const handles: { key: Handle; style: React.CSSProperties; cursor: string }[] = [
    { key: "nw", style: { top: -half, left: -half }, cursor: "nwse-resize" },
    { key: "ne", style: { top: -half, right: -half }, cursor: "nesw-resize" },
    { key: "sw", style: { bottom: -half, left: -half }, cursor: "nesw-resize" },
    { key: "se", style: { bottom: -half, right: -half }, cursor: "nwse-resize" },
    { key: "n", style: { top: -half, left: "50%", marginLeft: -half }, cursor: "ns-resize" },
    { key: "s", style: { bottom: -half, left: "50%", marginLeft: -half }, cursor: "ns-resize" },
    { key: "w", style: { top: "50%", left: -half, marginTop: -half }, cursor: "ew-resize" },
    { key: "e", style: { top: "50%", right: -half, marginTop: -half }, cursor: "ew-resize" },
  ];

  const hasCrop = crop.w > 0 && crop.h > 0;

  return (
    <div className="space-y-2">
      <p className="text-xs text-[#A1A1AA]">
        Click and drag to draw a bounding box. Drag handles to adjust.
      </p>
      <div
        ref={containerRef}
        className="relative inline-block select-none"
        style={{ cursor: "crosshair" }}
        onMouseDown={onContainerMouseDown}
      >
        <img
          ref={imgRef}
          src={imageSrc}
          alt="Source"
          className="max-w-full h-auto rounded block"
          onLoad={onImageLoad}
          draggable={false}
        />

        {hasCrop && (
          <>
            <div className="absolute inset-0 bg-black/60 pointer-events-none rounded" />
            <div
              className="absolute pointer-events-none"
              style={{ ...boxStyle, backgroundColor: "transparent", boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)", zIndex: 1 }}
            />
          </>
        )}

        {hasCrop && (
          <div
            className="absolute border border-[#FAFAFA] bg-transparent"
            style={{ ...boxStyle, zIndex: 2, cursor: "move" }}
            onMouseDown={(e) => onMouseDownHandle(e, "move")}
            data-handle="move"
          >
            {handles.map((h) => (
              <div
                key={h.key}
                data-handle={h.key}
                className="absolute bg-[#FAFAFA] rounded-[1px]"
                style={{ width: handleSize, height: handleSize, cursor: h.cursor, zIndex: 3, ...h.style }}
                onMouseDown={(e) => onMouseDownHandle(e, h.key)}
              />
            ))}
            <div
              className="absolute -top-6 left-0 bg-[#FAFAFA] text-[#09090B] text-[10px] font-mono px-1.5 py-0.5 rounded-sm whitespace-nowrap pointer-events-none"
              style={{ zIndex: 4 }}
            >
              {Math.round(crop.w)} x {Math.round(crop.h)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
