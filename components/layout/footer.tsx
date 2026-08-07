"use client";

import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  // Do not render Footer on the landing profile selection screen (/)
  if (pathname === "/") return null;

  return (
    <footer className="w-full border-t border-slate-800/80 bg-[#0b0f17]/90 py-6 text-xs text-slate-500">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6">
        <div className="inline-flex items-center gap-3 leading-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/intervu-logo.png"
            alt="Intervu Logo"
            className="w-[110px] h-auto object-contain"
          />
          <span className="leading-none text-slate-400">&mdash; AI Technical Interview Platform</span>
        </div>
      </div>
    </footer>
  );
}
