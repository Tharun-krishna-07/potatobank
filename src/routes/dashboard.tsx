import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { AppShell, GlassCard } from "@/components/app-shell";
import { AnimatedCounter } from "@/components/animated-counter";
import { getAccount } from "@/lib/bank.functions";
import { clearSession, getSession } from "@/lib/session";
import { ArrowDownToLine, ArrowUpFromLine, LogOut, Repeat, Clock } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Halo Bank" },
      { name: "description", content: "Your Halo Bank dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const nav = useNavigate();
  const load = useServerFn(getAccount);
  const [state, setState] = useState<{ acc_no: string; acc_name: string; balance: number } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sess = getSession();
    if (!sess) {
      nav({ to: "/login" });
      return;
    }
    load({ data: { acc_no: sess.acc_no } })
      .then((r) => setState(r))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load account"))
      .finally(() => setLoading(false));
  }, [load, nav]);

  const logout = () => {
    clearSession();
    nav({ to: "/" });
  };

  if (loading) {
    return (
      <AppShell>
        <div className="pt-16 text-center text-muted-foreground">Loading…</div>
      </AppShell>
    );
  }
  if (error || !state) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md pt-12">
          <GlassCard className="text-center">
            <p className="text-destructive">{error ?? "No session"}</p>
            <Link to="/login" className="btn-primary mt-4 inline-flex">
              Sign in
            </Link>
          </GlassCard>
        </div>
      </AppShell>
    );
  }

  const actions = [
    { label: "Deposit", to: "/deposit" as const, Icon: ArrowDownToLine },
    { label: "Withdraw", to: "/withdraw" as const, Icon: ArrowUpFromLine },
    { label: "Transfer", to: "/transfer" as const, Icon: Repeat },
    { label: "History", to: "/history" as const, Icon: Clock },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6 pt-4 sm:pt-8">
        <GlassCard className="animate-fade-in">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Account holder</div>
              <div className="mt-1 text-xl font-semibold">{state.acc_name}</div>
              <div className="mt-3 font-mono text-sm tracking-widest text-muted-foreground">
                {state.acc_no}
              </div>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-background/40 px-3 py-1.5 text-sm text-muted-foreground transition hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" /> Log out
            </button>
          </div>
          <div className="mt-10">
            <div className="text-sm text-muted-foreground">Current balance</div>
            <div className="mt-1 text-6xl font-semibold tracking-tight">
              <AnimatedCounter value={state.balance} />
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {actions.map(({ label, to, Icon }) => (
            <Link
              key={label}
              to={to}
              className="group rounded-3xl border border-glass-border bg-glass p-5 shadow-glass backdrop-blur-2xl transition hover:-translate-y-1"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/12 text-brand transition group-hover:scale-110">
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-4 text-base font-semibold">{label}</div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
