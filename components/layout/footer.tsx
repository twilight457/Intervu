import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border/60 bg-background/50 py-8 text-sm text-muted-foreground">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="font-semibold text-foreground">Intervu</span>
          <span>&mdash; AI-Powered Technical Interview Platform</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <Link href="/interview" className="hover:text-foreground transition-colors">
            Interview
          </Link>
          <Link href="/report" className="hover:text-foreground transition-colors">
            Report
          </Link>
        </div>
      </div>
    </footer>
  );
}
