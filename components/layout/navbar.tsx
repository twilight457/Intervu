"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, LayoutDashboard, Brain, FileCheck, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: Layers },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/interview", label: "Interview", icon: Brain },
    { href: "/report", label: "Report", icon: FileCheck },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-md transition-all">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 dark:from-white dark:to-indigo-300 bg-clip-text text-transparent">
              Intervu
            </span>
            <Badge variant="primary" className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0">
              AI Hackathon
            </Badge>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 p-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-indigo-600 dark:text-indigo-400" : "")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action / Profile Status Shell */}
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="hidden sm:inline-flex gap-1.5 py-1 px-3 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Foundation Ready
          </Badge>
        </div>
      </div>
    </header>
  );
}
