"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Trophy,
  LayoutGrid,
  Target,
  BarChart3,
  Users,
  Shield,
  Sun,
  Moon,
  Radio,
  GitCompare,
  Menu,
  X,
} from "lucide-react";
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
  { href: "/admin", label: "Admin", icon: Shield },
];

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onClick,
  className,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
        active
          ? "bg-wc-green/15 font-medium text-wc-green"
          : "text-gray-600 hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/5",
        className
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {label}
    </Link>
  );
}

export function Navbar() {
  const path = usePathname();
  const { theme, toggle } = useTheme();
  const { user, loading, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [path]);

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-gray-950/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="rounded-lg p-2 text-gray-600 hover:bg-black/5 lg:hidden dark:text-gray-300"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-wc-gold/15 ring-1 ring-wc-gold/30">
              <Trophy className="h-5 w-5 text-wc-gold" />
            </div>
            <span className="font-display text-sm font-bold tracking-tight">
              World Cup <span className="text-wc-green">Bracket</span>
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {NAV.map(({ href, label, icon }) => (
            <NavLink key={href} href={href} label={label} icon={icon} active={path === href} />
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden sm:block">
            <KickoffReminders />
          </div>
          <button
            type="button"
            onClick={toggle}
            className="rounded-lg p-2 text-gray-500 hover:bg-black/5"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {!loading && user ? (
            <button type="button" onClick={() => signOut()} className="btn-ghost hidden text-xs px-3 py-1.5 sm:inline-flex">
              Sign out
            </button>
          ) : (
            <Link href="/auth/login" className="btn-primary text-xs px-3 py-1.5">
              Sign in
            </Link>
          )}
        </div>
      </div>

      {/* Mobile sidebar */}
      <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 lg:hidden" />
          <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-[min(300px,88vw)] flex-col border-r border-black/10 bg-white shadow-2xl outline-none dark:border-white/10 dark:bg-gray-950 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left lg:hidden">
            <div className="flex items-center justify-between border-b border-black/5 px-4 py-4 dark:border-white/10">
              <Dialog.Title className="font-display text-sm font-bold">
                World Cup <span className="text-wc-green">Bracket</span>
              </Dialog.Title>
              <Dialog.Close className="rounded-lg p-2 text-gray-500 hover:bg-black/5 dark:hover:bg-white/10">
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
              {NAV.map(({ href, label, icon }) => (
                <NavLink
                  key={href}
                  href={href}
                  label={label}
                  icon={icon}
                  active={path === href}
                  onClick={() => setMenuOpen(false)}
                />
              ))}
            </nav>

            <div className="space-y-3 border-t border-black/5 p-4 dark:border-white/10">
              <KickoffReminders />
              {!loading && user ? (
                <button
                  type="button"
                  onClick={() => {
                    signOut();
                    setMenuOpen(false);
                  }}
                  className="btn-ghost w-full py-2.5 text-sm"
                >
                  Sign out
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMenuOpen(false)}
                  className="btn-primary flex w-full justify-center py-2.5 text-sm"
                >
                  Sign in
                </Link>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </header>
  );
}
