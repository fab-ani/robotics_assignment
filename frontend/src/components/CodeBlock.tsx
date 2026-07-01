interface Props {
  code: string;
  title?: string;
  running?: boolean;
}

export default function CodeBlock({ code, title = "Python", running = false }: Props) {
  return (
    <div className="bg-[#09090B] rounded-lg border border-[#27272A] overflow-hidden h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#27272A]">
        <span className="text-[10px] font-mono tracking-widest uppercase text-[#A1A1AA]">
          {title}{running ? " - Running" : ""}
        </span>
        <div className="flex gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]"
            style={running ? { animation: "traffic-pulse 1.2s ease-in-out infinite", animationDelay: "0s" } : undefined}
          />
          <div
            className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]"
            style={running ? { animation: "traffic-pulse 1.2s ease-in-out infinite", animationDelay: "0.2s" } : undefined}
          />
          <div
            className="w-2.5 h-2.5 rounded-full bg-[#28C840]"
            style={running ? { animation: "traffic-pulse 1.2s ease-in-out infinite", animationDelay: "0.4s" } : undefined}
          />
        </div>
      </div>
      <pre className="p-4 text-xs text-[#A1A1AA] overflow-x-auto leading-relaxed font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}
