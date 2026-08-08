"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const pathname = usePathname();

  // Do not render Navbar on the landing profile selection screen (/)
  if (pathname === "/") return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0b0f17]/90 backdrop-blur-md transition-all">
      <div className="max-w-5xl mx-auto flex h-20 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/dashboard" className="inline-flex items-center shrink-0 hover:opacity-90 transition-opacity">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/intervu-logo.png"
            alt="Intervu Logo"
            className="w-[150px] h-auto object-contain"
          />
        </Link>

        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Change Profile Button */}
          <Button
            asChild
            variant="outline"
            className="h-10 px-5 text-sm font-semibold rounded-xl border border-slate-700/80 bg-slate-800/90 hover:bg-slate-700 text-slate-100 hover:text-white shadow-xs transition-colors inline-flex items-center justify-center gap-2.5 whitespace-nowrap"
          >
            <Link href="/" className="inline-flex items-center justify-center gap-2.5">
              <UserCheck className="h-[18px] w-[18px] text-indigo-400 shrink-0" />
              <span>Change Profile</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
