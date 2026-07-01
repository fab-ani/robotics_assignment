"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/assignment1", label: "Assignment 1" },
  { href: "/assignment2", label: "Assignment 2" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-[#18181B] border-b border-[#27272A]">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="font-bold text-sm tracking-widest uppercase text-[#FAFAFA]">
            ICR // OpenCV Lab
          </Link>
          <div className="flex gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-1.5 rounded text-xs font-medium tracking-wide uppercase transition-all ${
                  pathname === link.href
                    ? "bg-[#FAFAFA] text-[#09090B]"
                    : "text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
