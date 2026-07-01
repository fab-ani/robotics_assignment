import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto space-y-12 py-12">
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-bold tracking-wide uppercase text-[#FAFAFA]">
          Intelligent Control & Robotics
        </h1>
        <p className="text-xs tracking-widest uppercase text-[#A1A1AA]">
          Image Processing Assignments // OpenCV
        </p>
        <div className="w-16 h-px bg-[#27272A] mx-auto" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link
          href="/assignment1"
          className="block bg-[#18181B] rounded-lg border border-[#27272A] p-6 hover:border-[#A1A1AA] transition-all group"
          style={{ animation: "glow-pulse 4s ease-in-out infinite" }}
        >
          <div className="space-y-4">
            <div className="w-10 h-10 bg-[#09090B] border border-[#27272A] rounded flex items-center justify-center text-[#FAFAFA] font-mono text-sm group-hover:bg-[#FAFAFA] group-hover:text-[#09090B] transition-colors">
              01
            </div>
            <h2 className="text-sm font-bold tracking-wide uppercase text-[#FAFAFA]">
              Introduction to OpenCV
            </h2>
            <p className="text-xs leading-relaxed text-[#A1A1AA]">
              Basic image processing: read/display, resize, crop, blur,
              thresholding, edge detection, comparative analysis.
            </p>
            <div className="text-[10px] font-mono tracking-widest text-[#A1A1AA]">
              8 TASKS
            </div>
          </div>
        </Link>

        <Link
          href="/assignment2"
          className="block bg-[#18181B] rounded-lg border border-[#27272A] p-6 hover:border-[#A1A1AA] transition-all group"
          style={{ animation: "glow-pulse 4s ease-in-out infinite 2s" }}
        >
          <div className="space-y-4">
            <div className="w-10 h-10 bg-[#09090B] border border-[#27272A] rounded flex items-center justify-center text-[#FAFAFA] font-mono text-sm group-hover:bg-[#FAFAFA] group-hover:text-[#09090B] transition-colors">
              02
            </div>
            <h2 className="text-sm font-bold tracking-wide uppercase text-[#FAFAFA]">
              OCR Vision System
            </h2>
            <p className="text-xs leading-relaxed text-[#A1A1AA]">
              Text recognition using OpenCV and Tesseract OCR: image
              acquisition, preprocessing, extraction, accuracy evaluation.
            </p>
            <div className="text-[10px] font-mono tracking-widest text-[#A1A1AA]">
              6 TASKS
            </div>
          </div>
        </Link>
      </div>

      <p className="text-center text-[10px] font-mono tracking-widest uppercase text-[#A1A1AA]/60">
        Prepared by Fabian H. Mbona
      </p>
    </div>
  );
}
