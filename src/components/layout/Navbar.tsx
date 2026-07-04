"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, LayoutGrid, Target, BarChart3, Users, Shield, Sun, Moon, Radio, GitCompare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAuth } from "@/lib/auth/AuthProvider";
import { KickoffReminders } from "@/components/pwa/KickoffReminders";

const NAV = [
  { href: "/", label: "Bracket", icon: LayoutGrid },
  { href: "/live", label: "Live", icon: Radio },
  { href: "/predictions", label: "Predictions", icon: Target },
  { href: "/compare", label: "Compare", icon: GitCompare },
  { href: "/leaderboard", label: "Leaderboard", icon: BarChart3 },
  { href: "/leagues", label: "Leagues", icon: Users },
];

export function Navbar() {
  const path = usePathname();
  const { theme, toggle } = useTheme();
  const { user, loading, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-gray-950/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-wc-gold/15 ring-1 ring-wc-gold/30">
            <Trophy className="h-5 w-5 text-wc-gold" />
          </div>
          <span className="font-display hidden text-sm font-bold tracking-tight sm:inline">
            World Cup <span className="text-wc-green">Bracket</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition",
                path === href
                  ? "bg-wc-green/10 text-wc-green font-medium"
                  : "text-gray-600 hover:bg-black/5 dark:text-gray-400"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
          <Link
            href="/admin"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-gray-500 hover:bg-black/5"
          >
            <Shield className="h-4 w-4" />
            Admin
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <KickoffReminders />
          <button
            type="button"
            onClick={toggle}
            className="rounded-lg p-2 text-gray-500 hover:bg-black/5"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {!loading && user ? (
            <button type="button" onClick={() => signOut()} className="btn-ghost text-xs px-3 py-1.5">
              Sign out
            </button>
          ) : (
            <Link href="/auth/login" className="btn-primary text-xs px-3 py-1.5">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

