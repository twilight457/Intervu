"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();

  // Do not render Navbar on the landing profile selection screen (/)
  if (pathname === "/") return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-md transition-all">
      <div className="max-w-5xl mx-auto flex h-20 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/dashboard" className="inline-flex items-center justify-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Intervu
          </span>
        </Link>

        {/* Change Profile Button */}
        <Button
          asChild
          variant="outline"
          className="h-10 px-5 text-sm font-semibold rounded-xl border-border/80 hover:bg-accent inline-flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Link href="/" className="inline-flex items-center justify-center gap-2">
            <UserCheck className="h-[18px] w-[18px] text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>Change Profile</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
