interface Props {
  title: string;
  children: React.ReactNode;
}

export default function TaskCard({ title, children }: Props) {
  return (
    <section className="bg-[#18181B] rounded-lg border border-[#27272A] overflow-hidden" style={{ animation: "glow-pulse 4s ease-in-out infinite" }}>
      <div className="px-6 py-3 border-b border-[#27272A]">
        <h2 className="text-sm font-bold tracking-wide uppercase text-[#FAFAFA]">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}
