interface Props {
  src: string;
  label: string;
  className?: string;
}

export default function ImageDisplay({ src, label, className = "" }: Props) {
  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-[10px] font-mono tracking-widest uppercase text-[#A1A1AA] text-center">{label}</p>
      <div className="bg-[#09090B] border border-[#27272A] rounded p-1.5">
        <img
          src={`data:image/png;base64,${src}`}
          alt={label}
          className="max-w-full h-auto mx-auto rounded"
        />
      </div>
    </div>
  );
}
