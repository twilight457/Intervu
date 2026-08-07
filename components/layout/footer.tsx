"use client";

import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  // Do not render Footer on the landing profile selection screen (/)
  if (pathname === "/") return null;

  return (
    <footer className="w-full border-t border-border/60 bg-background/50 py-6 text-xs text-muted-foreground">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6">
        <div className="inline-flex items-center gap-2.5 leading-none">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-600 text-white shrink-0">
            <Sparkles className="h-3 w-3" />
          </div>
          <span className="font-semibold text-foreground leading-none">Intervu</span>
          <span className="leading-none">&mdash; AI Technical Interview Platform</span>
        </div>
      </div>
    </footer>
  );
}
