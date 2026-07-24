import { Link } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { type ReactNode } from "react";
import { useTheme } from "./theme-provider";

export function AppShell({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();
  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas text-foreground">
      {/* Ambient gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-accent/25 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[520px] w-[520px] rounded-full bg-brand/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-[480px] w-[480px] rounded-full bg-accent2/25 blur-3xl" />
      </div>

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-white shadow-glass">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <ellipse cx="12" cy="12" rx="7" ry="9" transform="rotate(-20 12 12)" />
              <circle cx="9" cy="9" r="0.9" fill="hsl(var(--brand))" opacity="0.55" />
              <circle cx="14" cy="11" r="0.7" fill="hsl(var(--brand))" opacity="0.55" />
              <circle cx="11" cy="15" r="0.8" fill="hsl(var(--brand))" opacity="0.55" />
            </svg>
          </span>
          PotatoBank
        </Link>
        <button
          onClick={toggle}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-glass-border bg-glass backdrop-blur-xl transition hover:scale-105"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </header>
      <main className="mx-auto max-w-6xl px-6 pb-24">{children}</main>
    </div>
  );
}

export function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "rounded-3xl border border-glass-border bg-glass p-6 shadow-glass backdrop-blur-2xl transition " +
        className
      }
    >
      {children}
    </div>
  );
}
